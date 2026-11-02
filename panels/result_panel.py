import os

import wx


class ResultPanel(wx.Panel):
    def __init__(self, parent, result_dir: str):
        super().__init__(parent)
        self._result_dir = result_dir
        self._cards: list[tuple[str, bool]] = []  # (path, is_normal)
        self.SetBackgroundColour(wx.Colour(240, 243, 250))
        self._build_ui()

    def _build_ui(self):
        root = wx.BoxSizer(wx.HORIZONTAL)

        # ── Left: scrolled card list ─────────────────────────────────────
        left = wx.BoxSizer(wx.VERTICAL)
        lbl = wx.StaticText(self, label="생성된 카드 목록")
        lbl.SetFont(wx.Font(11, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD))
        left.Add(lbl, 0, wx.ALL, 8)

        self._scroll = wx.ScrolledWindow(self, size=(290, -1), style=wx.VSCROLL)
        self._scroll.SetScrollRate(0, 20)
        self._scroll.SetBackgroundColour(wx.Colour(240, 243, 250))
        self._scroll_sizer = wx.BoxSizer(wx.VERTICAL)
        self._scroll.SetSizer(self._scroll_sizer)
        left.Add(self._scroll, 1, wx.EXPAND | wx.LEFT | wx.RIGHT | wx.BOTTOM, 8)

        root.Add(left, 0, wx.EXPAND)
        root.Add(wx.StaticLine(self, style=wx.LI_VERTICAL), 0, wx.EXPAND | wx.TOP | wx.BOTTOM, 8)

        # ── Right: image preview ─────────────────────────────────────────
        right = wx.BoxSizer(wx.VERTICAL)
        lbl2 = wx.StaticText(self, label="선택한 카드 이미지")
        lbl2.SetFont(wx.Font(11, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD))
        right.Add(lbl2, 0, wx.ALL, 8)

        self._img_ctrl = wx.StaticBitmap(self, size=(400, 400))
        self._img_ctrl.SetBackgroundColour(wx.Colour(180, 190, 210))
        right.Add(self._img_ctrl, 1, wx.EXPAND | wx.LEFT | wx.RIGHT | wx.BOTTOM, 8)

        root.Add(right, 1, wx.EXPAND)
        self.SetSizer(root)

    def clear(self):
        self._cards.clear()
        self._scroll_sizer.Clear(delete_windows=True)
        self._scroll.FitInside()
        self._img_ctrl.SetBitmap(wx.NullBitmap)
        self.Layout()

    def add_image(self, path: str, is_normal: bool):
        idx = len(self._cards)
        self._cards.append((path, is_normal))
        self._add_row(idx, os.path.basename(path), is_normal)
        self._show_image(path)

    def _add_row(self, idx: int, name: str, is_normal: bool):
        row = wx.Panel(self._scroll)
        row.SetBackgroundColour(wx.Colour(228, 234, 248))
        sizer = wx.BoxSizer(wx.HORIZONTAL)

        # Card name button → preview image on click
        label = name[:20] if len(name) > 20 else name
        name_btn = wx.Button(row, label=label, size=(-1, 30))
        name_btn.SetFont(wx.Font(8, wx.FONTFAMILY_TELETYPE, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))
        name_btn.Bind(wx.EVT_BUTTON, lambda evt, i=idx: self._on_row_click(i))
        sizer.Add(name_btn, 1, wx.EXPAND | wx.RIGHT, 4)

        # 합격 button — always enabled; count only if card is actually normal
        accept_btn = wx.Button(row, label="합격", size=(50, 30))
        accept_btn.SetFont(wx.Font(9, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD))
        accept_btn.SetBackgroundColour(wx.Colour(30, 160, 80))
        accept_btn.SetForegroundColour(wx.WHITE)

        # 불량 button — always enabled
        reject_btn = wx.Button(row, label="불량", size=(50, 30))
        reject_btn.SetFont(wx.Font(9, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD))
        reject_btn.SetBackgroundColour(wx.Colour(200, 50, 50))
        reject_btn.SetForegroundColour(wx.WHITE)

        def _lock(abtn=accept_btn, rbtn=reject_btn):
            for b in (abtn, rbtn):
                b.Enable(False)
                b.SetBackgroundColour(wx.Colour(180, 180, 180))
                b.SetForegroundColour(wx.Colour(110, 110, 110))
                b.Refresh()

        def on_accept(evt):
            _lock()

        def on_reject(evt):
            _lock()

        accept_btn.Bind(wx.EVT_BUTTON, on_accept)
        reject_btn.Bind(wx.EVT_BUTTON, on_reject)

        sizer.Add(accept_btn, 0, wx.RIGHT, 2)
        sizer.Add(reject_btn, 0)
        row.SetSizer(sizer)

        self._scroll_sizer.Add(row, 0, wx.EXPAND | wx.LEFT | wx.RIGHT | wx.TOP, 3)
        self._scroll.FitInside()
        wx.CallAfter(self._scroll_to_bottom)

    def _scroll_to_bottom(self):
        _, vh = self._scroll.GetVirtualSize()
        self._scroll.Scroll(0, vh)

    def _on_row_click(self, idx: int):
        path, _ = self._cards[idx]
        self._show_image(path)

    def _show_image(self, path: str):
        if not os.path.exists(path):
            return
        img = wx.Image(path, wx.BITMAP_TYPE_PNG)
        orig_w, orig_h = img.GetWidth(), img.GetHeight()
        ctrl_w, ctrl_h = self._img_ctrl.GetSize()
        if ctrl_w < 50:
            ctrl_w, ctrl_h = 400, 400
        scale = min(ctrl_w / orig_w, ctrl_h / orig_h)
        new_w = max(1, int(orig_w * scale))
        new_h = max(1, int(orig_h * scale))
        img = img.Scale(new_w, new_h, wx.IMAGE_QUALITY_HIGH)
        self._img_ctrl.SetBitmap(wx.Bitmap(img))
        self.Layout()
