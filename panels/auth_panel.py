import wx

from panels.base_machine_panel import BaseMachinePanel


class AuthPanel(BaseMachinePanel):
    PROCESS_IMAGE = "step3_security_marking.png"

    def _build_control_buttons(self, sizer: wx.StaticBoxSizer):
        self._btn_loc = self._make_ctrl_btn("위치 조정", self._on_loc)
        sizer.Add(self._btn_loc, 1, wx.EXPAND | wx.ALL, 6)
        self._common_buttons(sizer)

    def _get_all_ctrl_buttons(self):
        btns = super()._get_all_ctrl_buttons()
        if hasattr(self, "_btn_loc"):
            btns.append(self._btn_loc)
        return btns

    def _on_loc(self, _evt):
        self._machine.loc = 1
        self._logger.write_control(self._machine.name, "위치 조정")
        wx.MessageBox("AuthMachine: 마킹 위치 교정 완료. loc=1(좌측하단).", "완료", wx.OK)
