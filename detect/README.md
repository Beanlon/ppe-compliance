# GearSight PPE detection — RT-DETR-L

Based on [PPE-SofEng-Training](https://github.com/DLGAquilon/PPE-SofEng-Training) sample window:

`upstream/scripts/demo/ppe_rtdetr_window.py`

**Not used:** YOLOv8, Downloads `best.pt`.

| File | Source |
| --- | --- |
| `models/rtdetr-l.pt` | `artifacts/rt-detr/rt-detr-i/weights/best.pt` (renamed) |
| `upstream/` | Demo script + class configs from the training repo |

## Setup

```powershell
cd detect
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Run

```powershell
npm run detect
```

Then `npm run dev` — Live Feed posts frames to `/api/detect` (Vite proxies to port 8765).
