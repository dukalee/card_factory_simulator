import os
import random
import string
from datetime import datetime


def generate_passwords() -> dict:
    """Generate a unique 4-digit password for each machine."""
    machines = ["InkMachine", "HoloMachine", "LogoMachine", "CuttingMachine"]
    passwords = {}
    used = set()
    for name in machines:
        while True:
            pw = "".join(random.choices(string.digits, k=4))
            if pw not in used:
                used.add(pw)
                passwords[name] = pw
                break
    return passwords


def write_manual(result_dir: str, passwords: dict):
    path = os.path.join(result_dir, "manual.txt")
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    lines = [
        "=== Card Factory Simulator Manual ===",
        f"생성일시: {now}",
        "",
        "* 컨트롤 사용 방법:",
        "  1. STOP 버튼을 눌러 시뮬레이션을 중단합니다.",
        "  2. 머신 탭을 선택하고 숫자패드에 4자리 PW를 입력한 뒤 [*]를 누릅니다.",
        "  3. PW가 맞으면 control 버튼이 활성화됩니다.",
        "  4. 버튼을 눌러 머신 상태를 복구한 후 START로 재개합니다.",
        "",
    ]

    ink_pw = passwords.get("InkMachine", "????")
    lines += [
        f"[InkMachine]  PW: {ink_pw}*",
        "  잉크추가 : 잉크 보충",
        "  윤활     : 윤활유 보충",
        "  정비     : 이물질 제거",
        "",
    ]

    holo_pw = passwords.get("HoloMachine", "????")
    lines += [
        f"[HoloMachine]  PW: {holo_pw}*",
        "  시트추가 : 홀로그램 시트 보충 ",
        "  윤활     : 윤활유 보충 ",
        "  정비     : 이물질 제거",
        "",
    ]

    logo_pw = passwords.get("LogoMachine", "????")
    lines += [
        f"[LogoMachine]  PW: {logo_pw}*",
        "  위치조정 : 마킹 위치 교정",
        "  윤활     : 윤활유 보충 ",
        "  정비     : 이물질 제거",
        "",
    ]

    cut_pw = passwords.get("CuttingMachine", "????")
    lines += [
        f"[CuttingMachine]  PW: {cut_pw}*",
        "  위치조정 : 커팅 위치 교정 ",
        "  윤활     : 윤활유 보충",
        "  정비     : 이물질 제거 ",
        "",
    ]

    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
