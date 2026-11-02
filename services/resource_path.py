import os
import sys


def resource_path(*parts: str) -> str:
    """PyInstaller(_MEIPASS)와 개발 환경 모두에서 올바른 절대 경로를 반환."""
    if getattr(sys, "frozen", False):
        base = sys._MEIPASS
    else:
        base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base, *parts)
