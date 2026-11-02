import wx

from panels.base_machine_panel import BaseMachinePanel


class HoloPanel(BaseMachinePanel):
    PROCESS_IMAGE = "step2_hologram.png"

    def _build_control_buttons(self, sizer: wx.StaticBoxSizer):
        self._btn_sheet = self._make_ctrl_btn("시트 추가", self._on_sheet)
        sizer.Add(self._btn_sheet, 1, wx.EXPAND | wx.ALL, 6)
        self._common_buttons(sizer)

    def _get_all_ctrl_buttons(self):
        btns = super()._get_all_ctrl_buttons()
        if hasattr(self, "_btn_sheet"):
            btns.append(self._btn_sheet)
        return btns

    def _on_sheet(self, _evt):
        self._machine.filled = 1
        self._logger.write_control(self._machine.name, "시트 추가")
        wx.MessageBox("HoloMachine: 홀로그램 시트 추가 완료. filled=1.", "완료", wx.OK)
