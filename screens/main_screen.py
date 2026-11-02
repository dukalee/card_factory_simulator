import os
import shutil

import wx


class MainScreen(wx.Frame):
    def __init__(self):
        super().__init__(None, title="Card Factory Simulator", size=(520, 340))
        self._result_dir = ""
        self.SetBackgroundColour(wx.Colour(235, 240, 252))
        self.Center()
        self._build_ui()

    def _build_ui(self):
        panel = wx.Panel(self)
        panel.SetBackgroundColour(wx.Colour(235, 240, 252))
        root = wx.BoxSizer(wx.VERTICAL)

        # Title
        title = wx.StaticText(panel, label="Card Factory Simulator")
        title.SetFont(wx.Font(20, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD))
        title.SetForegroundColour(wx.Colour(30, 60, 140))
        root.Add(title, 0, wx.CENTER | wx.TOP, 40)

        subtitle = wx.StaticText(panel, label="시뮬레이션을 시작하기 전 결과물 저장 폴더를 선택하세요.")
        subtitle.SetForegroundColour(wx.Colour(80, 90, 120))
        root.Add(subtitle, 0, wx.CENTER | wx.TOP, 14)

        # Folder row
        folder_row = wx.BoxSizer(wx.HORIZONTAL)
        self._folder_text = wx.TextCtrl(panel, size=(280, -1), style=wx.TE_READONLY)
        self._folder_text.SetHint("저장 폴더를 선택하세요...")
        browse_btn = wx.Button(panel, label="폴더 선택")
        browse_btn.SetBackgroundColour(wx.Colour(50, 90, 160))
        browse_btn.SetForegroundColour(wx.WHITE)
        browse_btn.Bind(wx.EVT_BUTTON, self._on_browse)
        folder_row.Add(self._folder_text, 1, wx.RIGHT, 8)
        folder_row.Add(browse_btn, 0)
        root.Add(folder_row, 0, wx.EXPAND | wx.LEFT | wx.RIGHT | wx.TOP, 40)

        # Start button
        start_btn = wx.Button(panel, label="시뮬레이터 시작", size=(200, 42))
        start_btn.SetFont(wx.Font(12, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD))
        start_btn.SetBackgroundColour(wx.Colour(30, 130, 80))
        start_btn.SetForegroundColour(wx.WHITE)
        start_btn.Bind(wx.EVT_BUTTON, self._on_start)
        root.Add(start_btn, 0, wx.CENTER | wx.TOP, 30)

        panel.SetSizer(root)

    def _on_browse(self, _evt):
        dlg = wx.DirDialog(self, "결과물 저장 폴더 선택", style=wx.DD_DEFAULT_STYLE)
        if dlg.ShowModal() == wx.ID_OK:
            self._result_dir = dlg.GetPath()
            self._folder_text.SetValue(self._result_dir)
        dlg.Destroy()

    def _on_start(self, _evt):
        if not self._result_dir:
            wx.MessageBox("저장 폴더를 먼저 선택해주세요.", "오류", wx.OK | wx.ICON_ERROR)
            return

        sim_dir = os.path.join(self._result_dir, "simulator_result")
        result_dir = os.path.join(sim_dir, "result")

        if os.path.exists(sim_dir):
            dlg = wx.MessageDialog(
                self,
                f"'{sim_dir}' 폴더가 이미 존재합니다.\n\n"
                "기존의 log.txt, manual.txt 및 result 폴더 내 모든 파일이\n"
                "삭제되고 초기화됩니다.\n\n"
                "계속하시겠습니까?",
                "기존 데이터 초기화 확인",
                wx.OK | wx.CANCEL | wx.ICON_WARNING,
            )
            if dlg.ShowModal() != wx.ID_OK:
                dlg.Destroy()
                return
            dlg.Destroy()

            # Delete log.txt and manual.txt
            for fname in ("log.txt", "manual.txt"):
                fpath = os.path.join(sim_dir, fname)
                if os.path.exists(fpath):
                    os.remove(fpath)

            # Clear result folder contents
            if os.path.exists(result_dir):
                shutil.rmtree(result_dir)

        os.makedirs(sim_dir, exist_ok=True)
        os.makedirs(result_dir, exist_ok=True)

        try:
            from screens.sim_screen import SimScreen
            sim = SimScreen(sim_dir, result_dir)
            sim.Show()
            self.Hide()
        except Exception as e:
            import traceback
            wx.MessageBox(f"시작 오류:\n{traceback.format_exc()}", "오류", wx.OK | wx.ICON_ERROR)
