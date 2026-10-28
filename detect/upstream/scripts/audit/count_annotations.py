"""Print image totals and annotation counts for PPE-Normalized-v2."""

from __future__ import annotations

from collections import Counter
from pathlib import Path

import yaml

PROJECT_ROOT = Path(__file__).resolve().parents[2]
V2_DIR = PROJECT_ROOT / "data" / "processed" / "PPE-Normalized-v2"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def class_names() -> list[str]:
    payload = yaml.safe_load((V2_DIR / "data.yaml").read_text(encoding="utf-8"))
    names = payload["names"]
    if isinstance(names, dict):
        return [names[key] for key in sorted(names, key=lambda item: int(item))]
    return [str(name) for name in names]


def splits() -> list[str]:
    root = V2_DIR / "images"
    return sorted(path.name for path in root.iterdir() if path.is_dir())


def main() -> None:
    names = class_names()
    present_splits = splits()
    instances = {split: Counter() for split in present_splits}
    images_with = {split: Counter() for split in present_splits}
    image_totals = {}
    person_only = {}

    for split in present_splits:
        image_dir = V2_DIR / "images" / split
        label_dir = V2_DIR / "labels" / split
        images = [
            path
            for path in image_dir.iterdir()
            if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
        ]
        image_totals[split] = len(images)
        only_person = 0
        for label in label_dir.glob("*.txt"):
            present: set[int] = set()
            for raw in label.read_text(encoding="utf-8").splitlines():
                parts = raw.split()
                if not parts:
                    continue
                class_id = int(float(parts[0]))
                instances[split][class_id] += 1
                present.add(class_id)
            for class_id in present:
                images_with[split][class_id] += 1
            if present == {0}:
                only_person += 1
        person_only[split] = only_person

    total_images = sum(image_totals.values())
    print(f"Total images: {total_images}")
    for split in present_splits:
        print(
            f"  {split}: {image_totals[split]} images, "
            f"{person_only[split]} person-only"
        )

    header = f"{'class':<18}" + "".join(f"{split:>8}" for split in present_splits) + f"{'total':>8}{'images':>8}"
    print("\nAnnotations (boxes) by class:")
    print(header)
    grand = 0
    for class_id, name in enumerate(names):
        row = [instances[split][class_id] for split in present_splits]
        image_row = sum(images_with[split][class_id] for split in present_splits)
        total = sum(row)
        grand += total
        counts = "".join(f"{value:>8}" for value in row)
        print(f"{name:<18}{counts}{total:>8}{image_row:>8}")
    print(f"{'TOTAL':<18}{grand:>{8 * (len(present_splits) + 1)}}")


if __name__ == "__main__":
    main()
