import os
import random
import threading
import time
import wx

from machines.ink_machine import InkMachine
from machines.holo_machine import HoloMachine
from machines.logo_machine import LogoMachine
from machines.cutting_machine import CuttingMachine
from services.logger_service import LoggerService
import services.image_service as image_service


class SimulationEngine(threading.Thread):
    def __init__(self, sim_dir: str, result_dir: str, machines: dict, callbacks: dict):
        super().__init__(daemon=True)
        self.sim_dir = sim_dir
        self.result_dir = result_dir
        self.ink: InkMachine = machines["ink"]
        self.holo: HoloMachine = machines["holo"]
        self.logo: LogoMachine = machines["logo"]
        self.cut: CuttingMachine = machines["cut"]
        self.logger = LoggerService(sim_dir)
        self.stop_event = threading.Event()

        self.on_highlight_tab = callbacks.get("on_highlight_tab")
        self.on_update_progress = callbacks.get("on_update_progress")
        self.on_result = callbacks.get("on_result")
        self.on_status = callbacks.get("on_status")
        self.on_stopped = callbacks.get("on_stopped")
        self.on_error = callbacks.get("on_error")

    def stop(self):
        self.stop_event.set()

    def run(self):
        machine_order = [self.ink, self.holo, self.logo, self.cut]
        try:
            for m in machine_order:
                m.status = 1

            while not self.stop_event.is_set():
                card_completed = True

                # ── 4개 머신 순차 처리 ─────────────────────────────────────────
                for machine in machine_order:
                    if self.stop_event.is_set():
                        card_completed = False
                        break

                    wx.CallAfter(self.on_highlight_tab, machine.name)
                    wx.CallAfter(self.on_update_progress, machine.name, 0)

                    if machine.fb == 0:
                        self.logger.write_error(machine.name)
                        wx.CallAfter(self.on_status, f"[ERROR] {machine.name}: 이물질 감지 — 공정 대기 중 (정비 후 재시작 필요)")
                        while not self.stop_event.is_set():
                            time.sleep(0.1)
                        card_completed = False
                        break

                    pt = machine.process_time
                    wx.CallAfter(self.on_status, f"{machine.name}: 공정 진행 중...")
                    process_start = time.time()

                    while not self.stop_event.is_set():
                        elapsed = time.time() - process_start
                        pct = min(elapsed / pt * 100.0, 100.0)
                        wx.CallAfter(self.on_update_progress, machine.name, pct)
                        if elapsed >= pt:
                            break
                        time.sleep(0.05)

                    if self.stop_event.is_set():
                        card_completed = False
                        break

                    self.logger.write_process(machine.name, process_start, time.time())
                    wx.CallAfter(self.on_update_progress, machine.name, 100)
                    wx.CallAfter(self.on_status, f"{machine.name}: 완료")

                if not card_completed or self.stop_event.is_set():
                    break

                # ── 머신 처리 완료 후 이미지 생성 시작 ────────────────────────────
                img_result: list = [None]
                img_ready = threading.Event()

                def _gen_image(ink, holo, logo, cut):
                    try:
                        os.makedirs(self.result_dir, exist_ok=True)
                        path = image_service.generate_card(
                            ink, holo, logo, cut, self.result_dir
                        )
                        img_result[0] = path
                    except Exception as exc:
                        img_result[0] = exc
                    finally:
                        img_ready.set()

                img_thread = threading.Thread(
                    target=_gen_image,
                    args=(self.ink, self.holo, self.logo, self.cut),
                    daemon=True,
                )
                wx.CallAfter(self.on_status, "이미지 생성 중...")
                img_thread.start()

                while not img_ready.is_set():
                    if self.stop_event.is_set():
                        card_completed = False
                        break
                    time.sleep(0.1)

                if not card_completed or self.stop_event.is_set():
                    break

                result = img_result[0]
                if isinstance(result, Exception):
                    short = str(result)[:120]
                    wx.CallAfter(self.on_status, f"[이미지 오류] {short}")
                    if self.on_error:
                        wx.CallAfter(self.on_error, short)
                    break

                is_normal = (self.holo.filled == 1 and self.cut.loc == 1)
                self.logger.write_card_created()
                wx.CallAfter(self.on_result, result, is_normal)
                wx.CallAfter(self.on_status, "카드 생성 완료")

                # ── 머신 상태 확률적 업데이트 ───────────────────────────────────
                self._update_states()

                # ── 5초 대기 ────────────────────────────────────────────────────
                wx.CallAfter(self.on_status, "다음 카드 생산 대기 중...")
                for _ in range(100):
                    if self.stop_event.is_set():
                        break
                    time.sleep(0.1)

        except Exception as exc:
            wx.CallAfter(self.on_status, f"[엔진 오류] {str(exc)[:100]}")
        finally:
            for m in machine_order:
                m.status = 0
            wx.CallAfter(self.on_stopped)

    def _update_states(self):
        self._degrade_one(self.ink,  ("ink",    0.15))
        self._degrade_one(self.holo, ("filled", 0.15))
        self._degrade_one(self.logo, None)
        self._degrade_one(self.cut,  ("loc",    0.15))

    def _degrade_one(self, m, extra):
        checks = []
        if m.fb == 1:
            checks.append(("fb", 0.05))
        if m.oil == 1:
            checks.append(("oil", 0.10))
        if extra:
            attr, prob = extra
            if getattr(m, attr) == 1:
                checks.append((attr, prob))

        random.shuffle(checks)
        for attr, prob in checks:
            if random.random() < prob:
                setattr(m, attr, 0)
                if attr == "oil":
                    m.process_time = 15
                return
