import os

import wx

from panels.numpad_widget import NumpadWidget
from panels.block_progress_bar import BlockProgressBar
from services.logger_service import LoggerService  # type hint only
from services.resource_path import resource_path

PROCESS_IMAGE_DIR = resource_path("processImage")

_GREY_BG = wx.Colour(180, 180, 180)
_GREY_FG = wx.Colour(110, 110, 110)


class BaseMachinePanel(wx.Panel):
    PROCESS_IMAGE: str = ""

    def __init__(self, parent, machine, get_all_machines, is_stopped_fn, logger: LoggerService):
        super().__init__(parent)
        self._machine = machine
        self._get_all_machines = get_all_machines
        self._is_stopped = is_stopped_fn
        self._logger = logger
        self._unlocked = False

        self.SetBackgroundColour(wx.Colour(240, 243, 250))
        self._build_ui()

    # ------------------------------------------------------------------ build
    def _build_ui(self):
        root = wx.BoxSizer(wx.VERTICAL)

        # Process image (above progress bar, original aspect ratio)
        img_ctrl = self._make_process_image_ctrl()
        if img_ctrl:
            root.Add(img_ctrl, 0, wx.CENTER | wx.TOP | wx.LEFT | wx.RIGHT, 10)

        # Block progress bar
        self._progress = BlockProgressBar(self)
        root.Add(self._progress, 0, wx.EXPAND | wx.LEFT | wx.RIGHT | wx.BOTTOM, 10)

        # Divider
        root.Add(wx.StaticLine(self), 0, wx.EXPAND | wx.LEFT | wx.RIGHT, 10)

        # Bottom area: centered horizontally
        center_row = wx.BoxSizer(wx.HORIZONTAL)
        inner = wx.BoxSizer(wx.HORIZONTAL)

        # PW section
        pw_box = wx.StaticBox(self, label="pw")
        pw_sizer = wx.StaticBoxSizer(pw_box, wx.VERTICAL)
        self._numpad = NumpadWidget(self, self._on_password_confirm)
        pw_sizer.Add(self._numpad, 0, wx.ALL, 6)
        inner.Add(pw_sizer, 0, wx.EXPAND | wx.RIGHT | wx.TOP | wx.BOTTOM, 12)

        # Control section
        ctrl_box = wx.StaticBox(self, label="control")
        self._ctrl_sizer = wx.StaticBoxSizer(ctrl_box, wx.VERTICAL)
        self._build_control_buttons(self._ctrl_sizer)
        inner.Add(self._ctrl_sizer, 0, wx.EXPAND | wx.TOP | wx.BOTTOM | wx.LEFT, 12)

        center_row.Add((0, 0), 1)
        center_row.Add(inner, 0, wx.ALIGN_CENTER_VERTICAL)
        center_row.Add((0, 0), 1)

        root.Add(center_row, 1, wx.EXPAND)
        self.SetSizer(root)

    def _make_process_image_ctrl(self):
        if not self.PROCESS_IMAGE:
            return None
        img_path = os.path.join(PROCESS_IMAGE_DIR, self.PROCESS_IMAGE)
        if not os.path.exists(img_path):
            return None
        bmp = wx.Bitmap(img_path, wx.BITMAP_TYPE_PNG)
        img = bmp.ConvertToImage()
        orig_w, orig_h = img.GetWidth(), img.GetHeight()
        max_h = 240
        if orig_h > max_h:
            scale = max_h / orig_h
            img = img.Scale(int(orig_w * scale), max_h, wx.IMAGE_QUALITY_HIGH)
        return wx.StaticBitmap(self, bitmap=wx.Bitmap(img))

    # ------------------------------------------------------------------ control buttons
    def _build_control_buttons(self, sizer: wx.StaticBoxSizer):
        self._common_buttons(sizer)

    def _common_buttons(self, sizer: wx.StaticBoxSizer):
        self._btn_oil = self._make_big_btn("윤활", self._on_oil)
        self._btn_repair = self._make_big_btn("정비", self._on_repair)
        sizer.Add(self._btn_oil, 1, wx.EXPAND | wx.ALL, 5)
        sizer.Add(self._btn_repair, 1, wx.EXPAND | wx.LEFT | wx.RIGHT | wx.BOTTOM, 5)
        self._set_controls_locked(True)

    def _make_ctrl_btn(self, label: str, handler, bg=None, fg=None) -> wx.Button:
        btn = wx.Button(self, label=label, size=(-1, 38))
        btn.SetFont(wx.Font(10, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD))
        bg_col = bg or wx.Colour(50, 90, 160)
        fg_col = fg or wx.WHITE
        btn.SetBackgroundColour(bg_col)
        btn.SetForegroundColour(fg_col)
        btn._orig_bg = bg_col
        btn._orig_fg = fg_col
        btn.Bind(wx.EVT_BUTTON, handler)
        return btn

    def _make_big_btn(self, label: str, handler) -> wx.Button:
        btn = wx.Button(self, label=label, size=(-1, 46))
        btn.SetFont(wx.Font(13, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD))
        bg_col = wx.Colour(50, 90, 160)
        fg_col = wx.WHITE
        btn.SetBackgroundColour(bg_col)
        btn.SetForegroundColour(fg_col)
        btn._orig_bg = bg_col
        btn._orig_fg = fg_col
        btn.Bind(wx.EVT_BUTTON, handler)
        return btn

    # ------------------------------------------------------------------ password
    def _on_password_confirm(self, digits: str):
        if not self._is_stopped():
            wx.MessageBox("시뮬레이션이 실행 중입니다.\nSTOP 후 입력하세요.", "알림", wx.OK | wx.ICON_INFORMATION)
            self._numpad.reset()
            return
        if digits == self._machine.password:
            self._unlocked = True
            self._set_controls_locked(False)
            self._logger.write_pw_success(self._machine.name)
            wx.MessageBox("인증 성공! 컨트롤이 활성화되었습니다.", "OK", wx.OK | wx.ICON_INFORMATION)
        else:
            self._logger.write_pw_fail(self._machine.name)
            wx.MessageBox("비밀번호가 틀렸습니다.", "오류", wx.OK | wx.ICON_ERROR)
        self._numpad.reset()

    def lock_controls(self):
        self._unlocked = False
        self._set_controls_locked(True)
        self._numpad.set_enabled(False)
        self._numpad.reset()

    def on_sim_stopped(self):
        self._numpad.set_enabled(True)

    def _set_controls_locked(self, locked: bool):
        for btn in self._get_all_ctrl_buttons():
            btn.Enable(not locked)
            if locked:
                btn.SetBackgroundColour(_GREY_BG)
                btn.SetForegroundColour(_GREY_FG)
            else:
                btn.SetBackgroundColour(getattr(btn, "_orig_bg", wx.Colour(50, 90, 160)))
                btn.SetForegroundColour(getattr(btn, "_orig_fg", wx.WHITE))
            btn.Refresh()

    def _get_all_ctrl_buttons(self):
        btns = []
        for attr in ("_btn_oil", "_btn_repair"):
            if hasattr(self, attr):
                btns.append(getattr(self, attr))
        return btns

    # ------------------------------------------------------------------ common control handlers
    def _on_oil(self, _evt):
        self._machine.oil = 1
        self._machine.process_time = 5
        self._logger.write_oil(self._machine.name)
        wx.MessageBox(f"{self._machine.name}: 윤활 완료.", "완료", wx.OK)

    def _on_repair(self, _evt):
        self._machine.fb = 1
        self._logger.write_fix(self._machine.name)
        wx.MessageBox(f"{self._machine.name}: 이물질 제거 완료.", "완료", wx.OK)

    # ------------------------------------------------------------------ UI update
    def set_progress(self, pct: float):
        self._progress.SetValue(int(pct))

    def show_error(self, show: bool):
        pass
