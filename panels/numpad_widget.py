import wx


class NumpadWidget(wx.Panel):
    """4-digit password numpad. Calls on_confirm(digits: str) when * is pressed."""

    def __init__(self, parent, on_confirm):
        super().__init__(parent)
        self._on_confirm = on_confirm
        self._digits = ""

        outer = wx.BoxSizer(wx.VERTICAL)

        self._display = wx.StaticText(self, label="입력: ----", style=wx.ALIGN_CENTER)
        self._display.SetFont(wx.Font(11, wx.FONTFAMILY_TELETYPE, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD))
        outer.Add(self._display, 0, wx.EXPAND | wx.BOTTOM, 6)

        grid = wx.GridSizer(4, 3, 4, 4)
        self._buttons: list[wx.Button] = []
        keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "←", "0", "*"]
        for k in keys:
            btn = wx.Button(self, label=k, size=(42, 36))
            btn.SetFont(wx.Font(11, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD))
            if k == "*":
                bg, fg = wx.Colour(70, 130, 180), wx.WHITE
            elif k == "←":
                bg, fg = wx.Colour(160, 90, 40), wx.WHITE
            else:
                bg, fg = wx.Colour(50, 90, 160), wx.WHITE
            btn.SetBackgroundColour(bg)
            btn.SetForegroundColour(fg)
            btn._orig_bg = bg
            btn._orig_fg = fg
            btn.Bind(wx.EVT_BUTTON, lambda evt, key=k: self._on_key(key))
            grid.Add(btn, 0, wx.EXPAND)
            self._buttons.append(btn)

        outer.Add(grid, 0)
        self.SetSizer(outer)

    def _on_key(self, key: str):
        if key == "*":
            if len(self._digits) == 4:
                self._on_confirm(self._digits)
            self._digits = ""
            self._update_display()
        elif key == "←":
            self._digits = self._digits[:-1]
            self._update_display()
        else:
            if len(self._digits) < 4:
                self._digits += key
                self._update_display()

    def _update_display(self):
        filled = "●" * len(self._digits) + "-" * (4 - len(self._digits))
        self._display.SetLabel(f"입력: {filled}")

    def set_enabled(self, enabled: bool):
        for btn in self._buttons:
            btn.Enable(enabled)
            if enabled:
                btn.SetBackgroundColour(btn._orig_bg)
                btn.SetForegroundColour(btn._orig_fg)
            else:
                btn.SetBackgroundColour(wx.Colour(180, 180, 180))
                btn.SetForegroundColour(wx.Colour(110, 110, 110))
            btn.Refresh()

    def reset(self):
        self._digits = ""
        self._update_display()
