import os
import random
import shutil

from machines.ink_machine import InkMachine
from machines.holo_machine import HoloMachine
from machines.logo_machine import LogoMachine
from machines.cutting_machine import CuttingMachine
from services.resource_path import resource_path

RESULT_IMAGE_DIR = resource_path("resultImage")


def _select_source(ink: InkMachine, holo: HoloMachine, cut: CuttingMachine) -> str:
    holo_part = "holo" if holo.filled == 1 else "normal"
    cut_part  = "centered" if cut.loc == 1 else "offcenter"
    prefix    = f"{holo_part}_{cut_part}"

    if ink.ink == 1:
        fullcolor = os.path.join(RESULT_IMAGE_DIR, f"{prefix}.png")
        if os.path.exists(fullcolor):
            return fullcolor
    else:
        candidates = [
            f for f in os.listdir(RESULT_IMAGE_DIR)
            if f.startswith(f"{prefix}_missing") and f.endswith(".png")
        ]
        if candidates:
            return os.path.join(RESULT_IMAGE_DIR, random.choice(candidates))

    # 파일이 없는 경우 → 같은 카테고리 첫 번째 파일로 대체
    candidates = sorted(f for f in os.listdir(RESULT_IMAGE_DIR)
                        if f.startswith(prefix) and f.endswith(".png"))
    if candidates:
        return os.path.join(RESULT_IMAGE_DIR, candidates[0])

    # 최후 fallback
    all_files = sorted(f for f in os.listdir(RESULT_IMAGE_DIR) if f.endswith(".png"))
    if all_files:
        return os.path.join(RESULT_IMAGE_DIR, all_files[0])

    raise FileNotFoundError("resultImage 폴더에 사용할 이미지가 없습니다.")


def generate_card(
    ink: InkMachine,
    holo: HoloMachine,
    logo: LogoMachine,
    cut: CuttingMachine,
    result_dir: str,
) -> str:
    src = _select_source(ink, holo, cut)
    os.makedirs(result_dir, exist_ok=True)
    existing = [f for f in os.listdir(result_dir) if f.startswith("card_") and f.endswith(".png")]
    next_num = len(existing) + 1
    dest = os.path.join(result_dir, f"card_{next_num:02d}.png")
    shutil.copy2(src, dest)
    return dest
