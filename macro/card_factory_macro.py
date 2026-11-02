"""
Card Factory Simulator 자동 정비 매크로 (Python + Playwright)

게임 화면 오른쪽 아래에 '🤖 자동 정비' 패널을 띄운다. 패널의 버튼을 누르면 파이썬이
  STOP → 정비 서랍 열기 → 머신 선택 → 비밀번호 입력 → 컨트롤 버튼 클릭 → (선택) START
를 사람이 하는 것과 똑같이 클릭으로 수행한다. 비밀번호는 게임 시작 직후 매뉴얼에서 한 번만 읽는다
(비밀번호는 새 게임/Reset 때만 바뀐다).

사용 예
  python card_factory_macro.py                      # 브라우저를 열고 패널 모드 (기본)
  python card_factory_macro.py --fix holo extra     # 한 번만 실행하고 종료: 홀로 '시트 추가'
  python card_factory_macro.py --selftest           # 헤드리스 자체 검증
  python card_factory_macro.py --url https://내-사이트/ # 배포한 사이트 주소로
"""
from __future__ import annotations

import argparse
import queue
import re
import sys
from dataclasses import dataclass

from playwright.sync_api import Page, sync_playwright

DEFAULT_URL = "http://localhost:5199/"


@dataclass(frozen=True)
class MachineInfo:
    game_name: str          # 게임 내 머신 이름 (매뉴얼/로그에 나오는 이름)
    tab: str                # 정비 서랍의 탭 이름
    label: str              # 화면 표시용
    controls: dict          # action -> 버튼 글자


# action: extra = 머신 고유 버튼, oil = 윤활, repair = 정비
MACHINES: dict[str, MachineInfo] = {
    "ink":  MachineInfo("InkMachine",     "Ink",  "잉크",   {"extra": "잉크 추가",  "oil": "윤활", "repair": "정비"}),
    "holo": MachineInfo("HoloMachine",    "Holo", "홀로",   {"extra": "시트 추가",  "oil": "윤활", "repair": "정비"}),
    "logo": MachineInfo("LogoMachine",    "Logo", "로고",   {"extra": "조정",       "oil": "윤활", "repair": "정비"}),
    "cut":  MachineInfo("CuttingMachine", "Cut",  "커팅",   {"extra": "위치 조정",  "oil": "윤활", "repair": "정비"}),
}
ACTIONS = ("extra", "oil", "repair")


class MacroError(RuntimeError):
    pass


class FactoryMacro:
    def __init__(self, page: Page, log=print):
        self.page = page
        self.log = log
        self.passwords: dict[str, str] = {}   # game_name -> 4자리

    # ── 게임 진행 ─────────────────────────────────────────────
    def ensure_game(self) -> None:
        """타이틀 화면이면 '시뮬레이터 시작'을 눌러 게임에 들어가고, 비밀번호를 읽어 둔다."""
        p = self.page
        start_title = p.get_by_role("button", name=re.compile("시뮬레이터 시작"))
        if start_title.count():
            start_title.first.click()
        p.locator(".topbar").wait_for(timeout=10_000)
        if not self.passwords:
            self.read_passwords()

    def read_passwords(self) -> None:
        """매뉴얼 창을 열어 4개 머신의 비밀번호를 읽는다. (새 게임/Reset 후에만 다시 읽으면 됨)"""
        p = self.page
        p.get_by_role("button", name=re.compile("매뉴얼")).click()
        text = p.locator(".manual-text").inner_text()
        found = dict(re.findall(r"\[(\w+Machine)\]\s+PW:\s*(\d{4})\*", text))
        p.get_by_role("button", name="닫기").click()
        if len(found) != 4:
            raise MacroError(f"매뉴얼에서 비밀번호를 읽지 못했습니다: {found}")
        self.passwords = found
        self.log(f"비밀번호 읽음: {found}")

    def is_running(self) -> bool:
        mode = self.page.locator(".topbar .chip", has_text="MODE").inner_text()
        return "RUNNING" in mode

    def stop(self) -> None:
        if self.is_running():
            self.page.get_by_role("button", name=re.compile("STOP")).click()
            # 엔진이 멈출 때까지 대기
            self.page.locator(".topbar .chip", has_text="STOPPED").wait_for(timeout=8_000)

    def start(self) -> None:
        btn = self.page.get_by_role("button", name=re.compile("START"))
        if btn.is_enabled():
            btn.click()

    # ── 정비 서랍 ─────────────────────────────────────────────
    def open_drawer(self) -> None:
        p = self.page
        if p.locator(".drawer.open").count() == 0:
            p.locator(".drawer-handle").click()
            p.locator(".drawer.open").wait_for(timeout=3_000)
            p.wait_for_timeout(350)   # 슬라이드 애니메이션

    def select_machine(self, key: str) -> None:
        tab = MACHINES[key].tab
        self.page.locator(".machine-tabs .mtab", has_text=re.compile(f"^{tab}$")).click()

    def _confirm_dialog(self) -> str:
        """열린 알림창의 문구를 읽고 '확인'을 누른다."""
        p = self.page
        body = p.locator(".modal-body")
        body.wait_for(timeout=3_000)
        msg = body.inner_text()
        p.locator(".modal-actions button", has_text="확인").click()
        p.locator(".modal-backdrop").wait_for(state="detached", timeout=3_000)
        return msg

    def unlock(self, key: str) -> None:
        p = self.page
        header = p.locator(".drawer h2").inner_text()
        if "인증됨" in header:
            return
        pw = self.passwords[MACHINES[key].game_name]
        keys = p.locator(".drawer .keys")
        for digit in pw:
            keys.get_by_role("button", name=digit, exact=True).click()
        keys.get_by_role("button", name="*", exact=True).click()
        msg = self._confirm_dialog()
        if "성공" not in msg:
            raise MacroError(f"{MACHINES[key].label} 인증 실패: {msg}")

    def press(self, key: str, action: str) -> str:
        label = MACHINES[key].controls[action]
        self.page.locator(".drawer .ctrl-row").get_by_role("button", name=label, exact=True).click()
        return self._confirm_dialog()

    # ── 한 번에: '홀로 시트 추가' 같은 작업 ─────────────────────
    def fix(self, key: str, action: str, resume: bool = True) -> str:
        if key not in MACHINES or action not in ACTIONS:
            raise MacroError(f"알 수 없는 작업: {key} {action}")
        info = MACHINES[key]
        self.ensure_game()
        was_running = self.is_running()
        self.stop()
        self.open_drawer()
        self.select_machine(key)
        self.unlock(key)
        result = self.press(key, action)
        self.log(f"[{info.label}] {info.controls[action]} 완료 → {result}")
        if resume and was_running:
            self.start()
        return result


# ── 화면 위 자동 정비 패널 (버튼 → 파이썬 호출) ───────────────────────
OVERLAY_JS = r"""
(() => {
  const MACHINES = %MACHINES%;
  function build() {
    if (document.getElementById('py-macro') || !document.body) return;
    const box = document.createElement('div');
    box.id = 'py-macro';
    box.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:99999;background:rgba(16,24,38,.96);color:#e6eefc;' +
      'border:1px solid #38bdf8;border-radius:10px;padding:10px 12px;font:12px "Segoe UI","Malgun Gothic",sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.5)';
    box.innerHTML = '<div style="font-weight:700;color:#38bdf8;margin-bottom:8px">🤖 자동 정비 ' +
      '<label style="font-weight:400;margin-left:8px"><input type="checkbox" id="py-resume" checked> 끝나면 START</label></div>' +
      '<div id="py-rows"></div><div id="py-msg" style="margin-top:8px;color:#9fb4d4;max-width:300px;min-height:15px"></div>';
    const rows = box.querySelector('#py-rows');
    const btn = 'border:0;border-radius:6px;padding:5px 9px;margin:2px;background:#2563eb;color:#fff;font:inherit;font-weight:700;cursor:pointer';
    for (const [key, m] of Object.entries(MACHINES)) {
      const row = document.createElement('div');
      row.innerHTML = '<span style="display:inline-block;width:34px;color:#9fb4d4">' + m.label + '</span>';
      for (const [action, label] of Object.entries(m.controls)) {
        const b = document.createElement('button');
        b.textContent = label; b.style.cssText = btn;
        b.onclick = () => window.pyFix(key, action, document.getElementById('py-resume').checked);
        row.appendChild(b);
      }
      rows.appendChild(row);
    }
    document.body.appendChild(box);
  }
  setInterval(build, 500);
})();
"""


def overlay_script() -> str:
    import json
    data = {k: {"label": m.label, "controls": m.controls} for k, m in MACHINES.items()}
    return OVERLAY_JS.replace("%MACHINES%", json.dumps(data, ensure_ascii=False))


def set_overlay_message(page: Page, text: str) -> None:
    try:
        page.evaluate("t => { const e = document.getElementById('py-msg'); if (e) e.textContent = t; }", text)
    except Exception:
        pass


def launch(pw, channel: str, headless: bool):
    last_err = None
    for ch in ([channel] if channel else ["chrome", "msedge"]):
        try:
            return pw.chromium.launch(channel=ch, headless=headless)
        except Exception as e:  # noqa: BLE001
            last_err = e
    raise MacroError(f"브라우저를 열 수 없습니다 (chrome/msedge 설치 확인): {last_err}")


def run_panel(url: str, channel: str) -> None:
    with sync_playwright() as pw:
        browser = launch(pw, channel, headless=False)
        page = browser.new_context(viewport={"width": 1280, "height": 900}).new_page()
        jobs: "queue.Queue[tuple[str, str, bool]]" = queue.Queue()
        # 패널 버튼은 작업을 큐에 넣기만 하고, 실제 조작은 아래 메인 루프에서 수행한다
        page.expose_function("pyFix", lambda key, action, resume: jobs.put((key, action, bool(resume))))
        page.add_init_script(overlay_script())
        macro = FactoryMacro(page, log=lambda m: (print(m), set_overlay_message(page, m)))
        page.goto(url)
        macro.ensure_game()
        print("준비 완료. 게임 화면의 '🤖 자동 정비' 패널 버튼을 누르세요. (창을 닫으면 종료)")
        while not page.is_closed():
            try:
                key, action, resume = jobs.get_nowait()
            except queue.Empty:
                page.wait_for_timeout(100)
                continue
            try:
                set_overlay_message(page, f"{MACHINES[key].label} {MACHINES[key].controls[action]} 진행 중…")
                macro.fix(key, action, resume)
            except Exception as e:  # noqa: BLE001
                print("실패:", e)
                set_overlay_message(page, f"실패: {e}")
        browser.close()


def run_once(url: str, channel: str, key: str, action: str, resume: bool, headless: bool) -> None:
    with sync_playwright() as pw:
        browser = launch(pw, channel, headless=headless)
        page = browser.new_context(viewport={"width": 1280, "height": 900}).new_page()
        macro = FactoryMacro(page)
        page.goto(url)
        macro.ensure_game()
        macro.start()
        page.wait_for_timeout(1500)
        macro.fix(key, action, resume)
        page.wait_for_timeout(1500)
        browser.close()


def selftest(url: str, channel: str) -> int:
    """게임을 돌리다가 '홀로 시트 추가'를 호출해서 로그로 결과를 확인한다."""
    with sync_playwright() as pw:
        browser = launch(pw, channel, headless=True)
        page = browser.new_context(viewport={"width": 1280, "height": 900}).new_page()
        macro = FactoryMacro(page)
        page.goto(url)
        macro.ensure_game()
        macro.start()
        page.wait_for_timeout(1200)
        assert macro.is_running(), "START 후 RUNNING 이어야 함"
        macro.fix("holo", "extra", resume=True)
        page.wait_for_timeout(600)
        macro.fix("cut", "oil", resume=False)
        page.wait_for_timeout(300)
        lines = [t for t in page.locator(".log-row").all_inner_texts()]
        for t in lines:
            print("  LOG:", re.sub(r"\s+", " ", t))
        ok = (
            any("HoloMachine 인증 성공" in t for t in lines)
            and any("HoloMachine 시트 추가" in t for t in lines)
            and any("CuttingMachine 인증 성공" in t for t in lines)
            and any("CuttingMachine 윤활 실시" in t for t in lines)
        )
        print("SELFTEST", "PASS" if ok else "FAIL", "| 비밀번호:", macro.passwords)
        browser.close()
        return 0 if ok else 1


def main() -> None:
    ap = argparse.ArgumentParser(description="Card Factory Simulator 자동 정비 매크로")
    ap.add_argument("--url", default=DEFAULT_URL)
    ap.add_argument("--channel", default="", help="chrome 또는 msedge (기본: 자동)")
    ap.add_argument("--fix", nargs=2, metavar=("MACHINE", "ACTION"),
                    help=f"한 번만 실행. MACHINE: {'/'.join(MACHINES)}  ACTION: {'/'.join(ACTIONS)}")
    ap.add_argument("--no-resume", action="store_true", help="정비 후 START 하지 않음")
    ap.add_argument("--headless", action="store_true")
    ap.add_argument("--selftest", action="store_true")
    args = ap.parse_args()

    if args.selftest:
        sys.exit(selftest(args.url, args.channel))
    if args.fix:
        run_once(args.url, args.channel, args.fix[0], args.fix[1], not args.no_resume, args.headless)
    else:
        run_panel(args.url, args.channel)


if __name__ == "__main__":
    main()
