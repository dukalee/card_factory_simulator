import wx

from panels.base_machine_panel import BaseMachinePanel


class InkPanel(BaseMachinePanel):
    PROCESS_IMAGE = "step1_cmyk.png"

    def _build_control_buttons(self, sizer: wx.StaticBoxSizer):
        self._btn_ink = self._make_ctrl_btn("잉크 추가", self._on_ink)

        row1 = wx.BoxSizer(wx.HORIZONTAL)
        row1.Add(self._btn_ink, 1, wx.EXPAND | wx.RIGHT, 2)
        sizer.Add(row1, 1, wx.EXPAND | wx.ALL, 6)

        self._common_buttons(sizer)

    def _get_all_ctrl_buttons(self):
        btns = super()._get_all_ctrl_buttons()
        if hasattr(self, "_btn_ink"):
            btns.append(self._btn_ink)
        return btns

    def _on_ink(self, _evt):
        self._machine.ink = 1
        self._logger.write_control(self._machine.name, "잉크 추가")
        wx.MessageBox("InkMachine: 잉크 보충 완료.", "완료", wx.OK)
