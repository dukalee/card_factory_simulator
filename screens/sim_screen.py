import os
import time

import wx

from machines.ink_machine import InkMachine
from machines.holo_machine import HoloMachine
from machines.logo_machine import LogoMachine
from machines.cutting_machine import CuttingMachine
from panels.ink_panel import InkPanel
from panels.holo_panel import HoloPanel
from panels.logo_panel import LogoPanel
from panels.cut_panel import CutPanel
from panels.result_panel import ResultPanel
from services.simulation_engine import SimulationEngine
from services.logger_service import LoggerService
from services import manual_service


TAB_NAMES = ["Ink", "Holo", "Logo", "Cut", "Result"]
MACHINE_NAMES = ["InkMachine", "HoloMachine", "LogoMachine", "CuttingMachine"]


class SimScreen(wx.Frame):
    def __init__(self, sim_dir: str, result_dir: str):
        super().__init__(None, title="Card Factory Simulator", size=(820, 680))
        self._sim_dir = sim_dir
        self._result_dir = result_dir
        self._engine: SimulationEngine | None = None
        self._running = False
        self._sim_error: list[str] = [""]
        self._logger = LoggerService(sim_dir)

        self._init_machines()
        self._init_session_files()
        self.SetBackgroundColour(wx.Colour(228, 234, 248))
        self.Center()
        self._build_ui()

    # ------------------------------------------------------------------ machines
    def _init_machines(self):
        self._ink = InkMachine()
        self._holo = HoloMachine()
        self._logo = LogoMachine()
        self._cut = CuttingMachine()
        self._all_machines = {
            "InkMachine": self._ink,
            "HoloMachine": self._holo,
            "LogoMachine": self._logo,
            "CuttingMachine": self._cut,
        }

    def _init_session_files(self):
        os.makedirs(self._sim_dir, exist_ok=True)
        passwords = manual_service.generate_passwords()
        manual_service.write_manual(self._sim_dir, passwords)
        log_path = os.path.join(self._sim_dir, "log.txt")
        if not os.path.exists(log_path):
            open(log_path, "w", encoding="utf-8").close()
        self._assign_passwords(passwords)

    def _assign_passwords(self, passwords: dict):
        self._ink.password = passwords["InkMachine"]
        self._holo.password = passwords["HoloMachine"]
        self._logo.password = passwords["LogoMachine"]
        self._cut.password = passwords["CuttingMachine"]

    # ------------------------------------------------------------------ UI
    def _build_ui(self):
        self._build_menubar()
        root = wx.BoxSizer(wx.VERTICAL)

        header = self._make_header()
        root.Add(header, 0, wx.EXPAND | wx.ALL, 8)
        root.Add(wx.StaticLine(self), 0, wx.EXPAND | wx.LEFT | wx.RIGHT, 8)

        self._notebook = wx.Notebook(self)
        self._notebook.SetBackgroundColour(wx.Colour(228, 234, 248))

        is_stopped = lambda: not self._running
        get_machines = lambda: list(self._all_machines.values())

        self._ink_panel = InkPanel(self._notebook, self._ink, get_machines, is_stopped, self._logger)
        self._holo_panel = HoloPanel(self._notebook, self._holo, get_machines, is_stopped, self._logger)
        self._logo_panel = LogoPanel(self._notebook, self._logo, get_machines, is_stopped, self._logger)
        self._cut_panel = CutPanel(self._notebook, self._cut, get_machines, is_stopped, self._logger)
        self._result_panel = ResultPanel(self._notebook, self._result_dir)

        self._machine_panels = {
            "InkMachine": self._ink_panel,
            "HoloMachine": self._holo_panel,
            "LogoMachine": self._logo_panel,
            "CuttingMachine": self._cut_panel,
        }

        self._notebook.AddPage(self._ink_panel, "Ink")
        self._notebook.AddPage(self._holo_panel, "Holo")
        self._notebook.AddPage(self._logo_panel, "Logo")
        self._notebook.AddPage(self._cut_panel, "Cut")
        self._notebook.AddPage(self._result_panel, "Result")

        root.Add(self._notebook, 1, wx.EXPAND | wx.ALL, 8)
        self.SetSizer(root)

    def _build_menubar(self):
        menubar = wx.MenuBar()
        menu = wx.Menu()
        self._menu_admin = menu.Append(wx.ID_ANY, "Admin")
        menu.AppendSeparator()
        self._menu_reset = menu.Append(wx.ID_ANY, "Reset")
        menu.AppendSeparator()
        self._menu_quit = menu.Append(wx.ID_EXIT, "Quit")
        menubar.Append(menu, "&File")
        self.SetMenuBar(menubar)
        self.Bind(wx.EVT_MENU, self._on_admin, self._menu_admin)
        self.Bind(wx.EVT_MENU, self._on_reset, self._menu_reset)
        self.Bind(wx.EVT_MENU, lambda _: self.Close(), self._menu_quit)

    def _make_header(self) -> wx.Panel:
        panel = wx.Panel(self)
        panel.SetBackgroundColour(wx.Colour(30, 50, 120))
        sizer = wx.BoxSizer(wx.HORIZONTAL)

        title = wx.StaticText(panel, label="Card Factory Simulator")
        title.SetForegroundColour(wx.WHITE)
        title.SetFont(wx.Font(13, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD))
        sizer.Add(title, 0, wx.CENTER | wx.LEFT, 12)

        sizer.Add((0, 0), 1)

        start_btn = wx.Button(panel, label="▶ START", size=(90, 30))
        start_btn.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD))
        start_btn.SetBackgroundColour(wx.Colour(30, 160, 80))
        start_btn.SetForegroundColour(wx.WHITE)
        start_btn.Bind(wx.EVT_BUTTON, self._on_start)
        sizer.Add(start_btn, 0, wx.CENTER | wx.RIGHT, 8)

        stop_btn = wx.Button(panel, label="■ STOP", size=(90, 30))
        stop_btn.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD))
        stop_btn.SetBackgroundColour(wx.Colour(200, 30, 30))
        stop_btn.SetForegroundColour(wx.WHITE)
        stop_btn.Bind(wx.EVT_BUTTON, self._on_stop)
        sizer.Add(stop_btn, 0, wx.CENTER | wx.RIGHT, 12)

        panel.SetSizer(sizer)
        panel.SetMinSize((-1, 44))
        return panel

    # ------------------------------------------------------------------ handlers
    def _on_start(self, _evt):
        if self._running:
            return
        self._sim_error[0] = ""
        self._logger.write_start()
        self._init_session_files()

        self._ink.status = 1
        self._holo.status = 1
        self._logo.status = 1
        self._cut.status = 1

        for panel in self._machine_panels.values():
            panel.lock_controls()

        callbacks = {
            "on_highlight_tab": self._on_highlight_tab,
            "on_update_progress": self._on_update_progress,
            "on_result": self._on_result,
            "on_status": self._on_status_update,
            "on_stopped": self._on_engine_stopped,
            "on_error": self._on_engine_error,
        }
        machines = {
            "ink": self._ink,
            "holo": self._holo,
            "logo": self._logo,
            "cut": self._cut,
        }

        self._engine = SimulationEngine(self._sim_dir, self._result_dir, machines, callbacks)
        self._running = True
        self._engine.start()

    def _on_stop(self, _evt):
        if not self._running:
            return
        self._logger.write_stop()
        if self._engine:
            self._engine.stop()

    def _on_admin(self, _evt):
        from screens.admin_dashboard import AdminDashboard
        dlg = wx.PasswordEntryDialog(self, "Admin 비밀번호를 입력하세요.", "Admin Dashboard")
        if dlg.ShowModal() == wx.ID_OK:
            if dlg.GetValue() == AdminDashboard.ADMIN_PASSWORD:
                dlg.Destroy()
                dash = AdminDashboard(self, self._all_machines, self._sim_error)
                dash.Show()
                return
            wx.MessageBox("비밀번호가 틀렸습니다.", "오류", wx.OK | wx.ICON_ERROR)
        dlg.Destroy()

    def _on_reset(self, _evt):
        if self._running:
            wx.MessageBox("시뮬레이션 실행 중에는 초기화할 수 없습니다.\nSTOP 후 시도하세요.", "알림", wx.OK | wx.ICON_INFORMATION)
            return
        confirm = wx.MessageBox(
            "log.txt를 초기화하고, 매뉴얼을 새로 작성하며, 결과 이미지를 모두 삭제합니다.\n계속하시겠습니까?",
            "Reset", wx.YES_NO | wx.ICON_WARNING
        )
        if confirm != wx.YES:
            return

        log_path = os.path.join(self._sim_dir, "log.txt")
        open(log_path, "w", encoding="utf-8").close()

        passwords = manual_service.generate_passwords()
        manual_service.write_manual(self._sim_dir, passwords)
        self._assign_passwords(passwords)

        for fname in os.listdir(self._result_dir):
            if fname.lower().endswith(".png"):
                try:
                    os.remove(os.path.join(self._result_dir, fname))
                except OSError:
                    pass

        # Reset all machine states
        for m in self._all_machines.values():
            m.status = 0
            m.fb = 1
            m.oil = 1
            m.process_time = 5
        self._ink.ink = 1
        self._holo.filled = 1
        self._logo.loc = 1
        self._cut.loc = 1

        self._logger.reset_count()
        self._result_panel.clear()

        wx.MessageBox("초기화 완료.", "Reset", wx.OK | wx.ICON_INFORMATION)

    # ------------------------------------------------------------------ engine callbacks
    def _on_highlight_tab(self, machine_name: str):
        idx_map = {
            "InkMachine": 0,
            "HoloMachine": 1,
            "LogoMachine": 2,
            "CuttingMachine": 3,
        }
        idx = idx_map.get(machine_name, 0)
        self._notebook.SetSelection(idx)

    def _on_update_progress(self, machine_name: str, pct: float):
        panel = self._machine_panels.get(machine_name)
        if panel:
            panel.set_progress(pct)

    def _on_result(self, path: str, is_normal: bool):
        self._result_panel.add_image(path, is_normal)
        self._notebook.SetSelection(4)

    def _on_status_update(self, _msg: str):
        pass

    def _on_engine_error(self, msg: str):
        self._sim_error[0] = msg

    def _on_engine_stopped(self):
        self._running = False
        for panel in self._machine_panels.values():
            panel.set_progress(0)
            panel.on_sim_stopped()
