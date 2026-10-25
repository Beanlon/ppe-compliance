"""
GearSight PPE detect API — Ultralytics RT-DETR-L.

Mirrors PPE-SofEng-Training/scripts/demo/ppe_rtdetr_window.py:
  model = RTDETR(weights)
  result = model.predict(frame, imgsz=640, conf=0.35, ...)

Weights: detect/models/rtdetr-l.pt
  (copied from artifacts/rt-detr/rt-detr-i/weights/best.pt — NOT YOLOv8)

Start:
  .\\.venv\\Scripts\\python.exe -m uvicorn server:app --host 127.0.0.1 --port 8765
"""

from __future__ import annotations

import io
from pathlib import Path
from typing import Any

import torch
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from ultralytics import RTDETR

ROOT = Path(__file__).resolve().parent
# Same file as upstream artifacts/rt-detr/rt-detr-i/weights/best.pt, renamed
# so it is never confused with the YOLOv8 Downloads/best.pt.
WEIGHTS = ROOT / "models" / "rtdetr-l.pt"

CLASS_NAMES = [
    "person",
    "helmet",
    "gloves",
    "high_visibility",
    "boots",
    "safety_glasses",
    "harness",
]

PPE_LABELS = {
    "helmet": "Helmet",
    "gloves": "Gloves",
    "high_visibility": "High Visibility Suit",
    "boots": "Boots",
    "safety_glasses": "Safety Glasses",
    "harness": "Harness",
}

REQUIRED_COUNTS = {"Gloves": 2}
DEFAULT_REQUIRED = ["Helmet", "High Visibility Suit", "Boots"]

# Match the sample window
IMGSZ = 640
CONF = 0.35

app = FastAPI(title="GearSight PPE Detect (RT-DETR-L)", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_model: RTDETR | None = None
_device: int | str = 0 if torch.cuda.is_available() else "cpu"


def get_model() -> RTDETR:
    global _model
    if _model is None:
        if not WEIGHTS.is_file():
            raise FileNotFoundError(
                f"Missing {WEIGHTS}. Copy RT-DETR weights from "
                "PPE-SofEng-Training/artifacts/rt-detr/rt-detr-i/weights/best.pt"
            )
        _model = RTDETR(str(WEIGHTS))
    return _model


def xyxy_to_pct(
    x1: float, y1: float, x2: float, y2: float, width: int, height: int
) -> dict[str, float]:
    if width <= 0 or height <= 0:
        return {"x": 0.0, "y": 0.0, "w": 0.0, "h": 0.0}
    return {
        "x": round(100.0 * x1 / width, 2),
        "y": round(100.0 * y1 / height, 2),
        "w": round(100.0 * (x2 - x1) / width, 2),
        "h": round(100.0 * (y2 - y1) / height, 2),
    }


def center_inside(inner: dict[str, float], outer: dict[str, float]) -> bool:
    cx = inner["x"] + inner["w"] / 2.0
    cy = inner["y"] + inner["h"] / 2.0
    return (
        outer["x"] <= cx <= outer["x"] + outer["w"]
        and outer["y"] <= cy <= outer["y"] + outer["h"]
    )


def parse_required(raw: str | None) -> list[str]:
    if not raw or not raw.strip():
        return list(DEFAULT_REQUIRED)
    items = [p.strip() for p in raw.split(",") if p.strip()]
    return items or list(DEFAULT_REQUIRED)


def group_people(
    detections: list[dict[str, Any]], required: list[str]
) -> list[dict[str, Any]]:
    persons = [d for d in detections if d["class"] == "person"]
    gear = [d for d in detections if d["class"] != "person"]
    people: list[dict[str, Any]] = []

    for index, person in enumerate(persons):
        assigned: dict[str, list[dict[str, Any]]] = {
            label: [] for label in PPE_LABELS.values()
        }
        for item in gear:
            label = PPE_LABELS.get(item["class"])
            if label and center_inside(item["box"], person["box"]):
                assigned[label].append(item)

        ppe_rows: list[dict[str, Any]] = []
        missing = 0
        for label in required:
            hits = assigned.get(label, [])
            need = REQUIRED_COUNTS.get(label, 1)
            found = len(hits)
            detected = found >= need
            if not detected:
                missing += 1
            best = max(hits, key=lambda row: row["confidence"], default=None)
            ppe_rows.append(
                {
                    "id": f"p{index}-{label.lower().replace(' ', '-')}",
                    "label": label,
                    "detected": detected,
                    "confidence": best["confidence"] if best else None,
                    "requiredCount": need if need > 1 else None,
                    "detectedCount": found if need > 1 else None,
                    "box": best["box"] if best else None,
                }
            )

        for label, hits in assigned.items():
            if label in required or not hits:
                continue
            best = max(hits, key=lambda row: row["confidence"])
            ppe_rows.append(
                {
                    "id": f"p{index}-extra-{label.lower().replace(' ', '-')}",
                    "label": label,
                    "detected": True,
                    "confidence": best["confidence"],
                    "box": best["box"],
                }
            )

        people.append(
            {
                "id": f"person-{index}",
                "label": f"Person {index + 1}",
                "box": person["box"],
                "status": "compliant" if missing == 0 else "non_compliant",
                "ppe": ppe_rows,
            }
        )
    return people


def _health() -> dict[str, Any]:
    return {
        "ok": True,
        "model": "RT-DETR-L",
        "weights": WEIGHTS.name,
        "weightsPresent": WEIGHTS.is_file(),
        "device": "cuda" if _device != "cpu" else "cpu",
        "classes": CLASS_NAMES,
    }


@app.get("/health")
@app.get("/detect/health")
def health() -> dict[str, Any]:
    return _health()


@app.post("/detect")
async def detect(
    file: UploadFile = File(...),
    conf: float = Form(CONF),
    required_ppe: str | None = Form(None),
) -> dict[str, Any]:
    global _device
    image = Image.open(io.BytesIO(await file.read())).convert("RGB")
    width, height = image.size
    required = parse_required(required_ppe)
    model = get_model()

    # Pass the PIL image. Ultralytics converts PIL to BGR, which is the same
    # channel order as the OpenCV frames in ppe_rtdetr_window.py. A NumPy
    # array made from this RGB image would be treated as BGR and the model
    # would see red and blue swapped.
    try:
        result = model.predict(
            image, imgsz=IMGSZ, conf=conf, device=_device, verbose=False
        )[0]
    except RuntimeError as exc:
        if _device == "cpu" or "CUDA" not in str(exc).upper():
            raise
        _device = "cpu"
        result = model.predict(
            image, imgsz=IMGSZ, conf=conf, device="cpu", verbose=False
        )[0]

    detections: list[dict[str, Any]] = []
    boxes = result.boxes
    if boxes is not None:
        for coords, score, class_id in zip(
            boxes.xyxy.tolist(), boxes.conf.tolist(), boxes.cls.tolist()
        ):
            idx = int(class_id)
            name = result.names.get(
                idx, CLASS_NAMES[idx] if idx < len(CLASS_NAMES) else str(idx)
            )
            x1, y1, x2, y2 = coords
            detections.append(
                {
                    "class": name,
                    "confidence": round(float(score), 4),
                    "box": xyxy_to_pct(x1, y1, x2, y2, width, height),
                }
            )

    return {
        "width": width,
        "height": height,
        "model": "RT-DETR-L",
        "device": "cuda" if _device != "cpu" else "cpu",
        "requiredPpe": required,
        "detections": detections,
        "people": group_people(detections, required),
    }


@app.on_event("startup")
def warm_model() -> None:
    if not WEIGHTS.is_file():
        print(f"[detect] WARNING: missing {WEIGHTS}")
        return
    print(f"[detect] Loading RT-DETR-L {WEIGHTS.name} on {_device}…")
    get_model()
    print("[detect] Ready.")
