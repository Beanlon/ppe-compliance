"""Sample window for the trained RT-DETR-L weights.

Opens the webcam, and can also run one chosen photo. Weights:

    artifacts/rt-detr/rt-detr-i/weights/best.pt
"""

from __future__ import annotations

import threading
import tkinter as tk
from pathlib import Path
from tkinter import filedialog, ttk

import cv2
import torch
from PIL import Image, ImageTk
from ultralytics import RTDETR

ROOT = Path(__file__).resolve().parents[2]
WEIGHTS = ROOT / "artifacts" / "rt-detr" / "rt-detr-i" / "weights" / "best.pt"
IMAGE_TYPES = [("Images", "*.jpg *.jpeg *.png *.bmp *.webp")]
VIEW_SIZE = (960, 540)


class DetectorWindow:
    def __init__(self) -> None:
        if not WEIGHTS.is_file():
            raise FileNotFoundError(WEIGHTS)

        self.device: int | str = 0 if torch.cuda.is_available() else "cpu"
        self.model: RTDETR | None = None
        self.capture: cv2.VideoCapture | None = None
        self.camera_running = False
        self.busy = False
        self.photo: ImageTk.PhotoImage | None = None

        self.root = tk.Tk()
        self.root.title("PPE RT-DETR")
        self.root.minsize(720, 520)
        self.status = tk.StringVar(value="Load a photo or start the camera.")

        self.view = ttk.Label(self.root, anchor="center")
        self.view.pack(fill="both", expand=True, padx=12, pady=(12, 8))

        buttons = ttk.Frame(self.root)
        buttons.pack(fill="x", padx=12)
        ttk.Button(buttons, text="Start camera", command=self.start_camera).pack(side="left")
        ttk.Button(buttons, text="Stop camera", command=self.stop_camera).pack(side="left", padx=8)
        ttk.Button(buttons, text="Open image", command=self.open_image).pack(side="left")

        ttk.Label(self.root, textvariable=self.status, wraplength=900).pack(
            fill="x", padx=12, pady=12
        )
        self.root.protocol("WM_DELETE_WINDOW", self.close)

    def load_model(self) -> RTDETR:
        if self.model is None:
            self.status.set(f"Loading {WEIGHTS.name}…")
            self.root.update_idletasks()
            self.model = RTDETR(str(WEIGHTS))
        return self.model

    def predict(self, frame):
        model = self.load_model()
        try:
            result = model.predict(
                frame, imgsz=640, conf=0.35, device=self.device, verbose=False
            )[0]
        except RuntimeError as exc:
            if self.device == "cpu" or "CUDA" not in str(exc).upper():
                raise
            self.device = "cpu"
            self.status.set("GPU reset the driver. Continuing on CPU.")
            result = model.predict(
                frame, imgsz=640, conf=0.35, device="cpu", verbose=False
            )[0]
        return result

    def show(self, frame, summary: str) -> None:
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image = Image.fromarray(rgb)
        image.thumbnail(VIEW_SIZE, Image.Resampling.LANCZOS)
        self.photo = ImageTk.PhotoImage(image)
        self.view.configure(image=self.photo)
        self.status.set(summary)

    def summary(self, result) -> str:
        counts: dict[str, int] = {}
        boxes = result.boxes
        if boxes is not None:
            for cls_id in boxes.cls.tolist():
                name = result.names[int(cls_id)]
                counts[name] = counts.get(name, 0) + 1
        found = ", ".join(f"{name} {count}" for name, count in counts.items()) or "no boxes"
        where = "CPU" if self.device == "cpu" else "GPU"
        return f"{where}: {found}"

    def start_camera(self) -> None:
        if self.camera_running:
            return
        capture = cv2.VideoCapture(0, cv2.CAP_DSHOW)
        if not capture.isOpened():
            capture.release()
            self.status.set("Camera 0 did not open.")
            return
        self.load_model()
        self.capture = capture
        self.camera_running = True
        self.status.set("Camera on.")
        self.tick_camera()

    def tick_camera(self) -> None:
        if not self.camera_running or self.capture is None:
            return
        if self.busy:
            self.root.after(30, self.tick_camera)
            return
        ok, frame = self.capture.read()
        if not ok:
            self.stop_camera()
            self.status.set("Camera frame failed.")
            return
        self.busy = True

        def work() -> None:
            try:
                result = self.predict(frame)
                drawn = result.plot()
                text = self.summary(result)
            except Exception as exc:
                drawn = frame
                text = f"Detection failed: {exc}"

            def apply() -> None:
                self.busy = False
                if self.camera_running:
                    self.show(drawn, text)
                    self.root.after(1, self.tick_camera)

            self.root.after(0, apply)

        threading.Thread(target=work, daemon=True).start()

    def stop_camera(self) -> None:
        self.camera_running = False
        if self.capture is not None:
            self.capture.release()
            self.capture = None

    def open_image(self) -> None:
        self.stop_camera()
        path = filedialog.askopenfilename(title="Sample image", filetypes=IMAGE_TYPES)
        if not path:
            return
        frame = cv2.imread(path)
        if frame is None:
            self.status.set(f"Could not read {path}")
            return
        self.status.set(f"Running {Path(path).name}…")
        self.root.update_idletasks()
        self.load_model()

        def work() -> None:
            try:
                result = self.predict(frame)
                drawn = result.plot()
                text = f"{Path(path).name} — {self.summary(result)}"
            except Exception as exc:
                drawn = frame
                text = f"Detection failed: {exc}"
            self.root.after(0, lambda: self.show(drawn, text))

        threading.Thread(target=work, daemon=True).start()

    def close(self) -> None:
        self.stop_camera()
        self.root.destroy()

    def run(self) -> None:
        self.root.mainloop()


if __name__ == "__main__":
    DetectorWindow().run()
