# PPE-SofEng

PPE detection for construction and utility workers. This repo trains and
checks two detectors, then runs the trained RT-DETR checkpoint in a sample
window.

The images, raw downloads, and weight files are not in git. Put them back
in the paths below before training or opening the window.

## Classes

Keep this order. There is no safety-suit class.

| ID | Class |
| -- | ----- |
| 0 | person |
| 1 | helmet |
| 2 | gloves |
| 3 | high_visibility |
| 4 | boots |
| 5 | safety_glasses |
| 6 | harness |

## Layout

| Path | In git | Purpose |
| --- | --- | --- |
| `notebooks/ppe_yolov8_vs_rfdetr.ipynb` | yes | GPU check, class check, 90/10 split, YOLOv8, RF-DETR Small |
| `scripts/demo/ppe_rtdetr_window.py` | yes | Camera and photo window for RT-DETR-L |
| `configs/ppe_normalized_v2.example.yaml` | yes | Class list to copy into the dataset folder |
| `data/processed/PPE-Normalized-v2/` | no | 90/10 images and labels, about 7,936 train and 882 val |
| `artifacts/yolov8/ppe_yolov8s/weights/best.pt` | no | Trained YOLOv8s weights |
| `artifacts/rt-detr/rt-detr-i/weights/best.pt` | no | Trained RT-DETR-L weights |

## Setup

Python 3.10–3.13. Python 3.14 does not run this stack.

```powershell
py -3.13 -m venv .venv313
.\.venv313\Scripts\Activate.ps1
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124
pip install -r requirements.txt
```

## Train

Open `notebooks/ppe_yolov8_vs_rfdetr.ipynb` and run the sections in order.
Training details are in [docs/TRAINING.md](docs/TRAINING.md).

## Sample window

```powershell
.\.venv313\Scripts\python.exe scripts\demo\ppe_rtdetr_window.py
```

**Start camera** uses the webcam. **Open image** runs one photo. The window
loads `artifacts/rt-detr/rt-detr-i/weights/best.pt`.

## Share this folder

[docs/SHARE.md](docs/SHARE.md) is the push checklist and the way to send
the weight files.
