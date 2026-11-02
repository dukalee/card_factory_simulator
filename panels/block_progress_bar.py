import wx


class BlockProgressBar(wx.Panel):
    """Discrete block-style progress bar showing [■■■░░░] XX%"""

    NUM_BLOCKS = 20

    def __init__(self, parent):
        super().__init__(parent, size=(-1, 32))
        self._value = 0
        self.SetBackgroundColour(parent.GetBackgroundColour())
        self.Bind(wx.EVT_PAINT, self._on_paint)
        self.Bind(wx.EVT_SIZE, lambda _: self.Refresh())

    def SetValue(self, v: int):
        v = max(0, min(100, v))
        if v != self._value:
            self._value = v
            self.Refresh()

    def GetValue(self) -> int:
        return self._value

    def _on_paint(self, _evt):
        dc = wx.BufferedPaintDC(self)
        dc.SetBackground(wx.Brush(self.GetBackgroundColour()))
        dc.Clear()

        w, h = self.GetSize()
        n = self.NUM_BLOCKS
        filled = round(n * self._value / 100)

        font = wx.Font(10, wx.FONTFAMILY_TELETYPE, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD)
        dc.SetFont(font)
        pct_str = f"{self._value:3d}%"
        tw, th = dc.GetTextExtent(pct_str)

        # Layout
        pad = 4
        bar_x = pad
        bar_y = pad
        bar_h = h - pad * 2
        bar_w = w - tw - 16

        # Outer rounded border
        dc.SetPen(wx.Pen(wx.Colour(80, 110, 180), 1))
        dc.SetBrush(wx.TRANSPARENT_BRUSH)
        dc.DrawRoundedRectangle(bar_x, bar_y, bar_w, bar_h, 3)

        # Individual blocks
        inner_x = bar_x + 3
        inner_w = bar_w - 6
        blk_gap = 2
        blk_w = max(4, (inner_w - blk_gap * (n + 1)) // n)

        for i in range(n):
            bx = inner_x + blk_gap + i * (blk_w + blk_gap)
            by = bar_y + 3
            bh = bar_h - 6
            if bx + blk_w > bar_x + bar_w - 3:
                break
            if i < filled:
                dc.SetBrush(wx.Brush(wx.Colour(50, 190, 80)))
                dc.SetPen(wx.Pen(wx.Colour(30, 150, 50), 1))
            else:
                dc.SetBrush(wx.Brush(wx.Colour(210, 220, 240)))
                dc.SetPen(wx.Pen(wx.Colour(180, 195, 225), 1))
            dc.DrawRectangle(bx, by, blk_w, bh)

        # Percentage text (right of bar)
        dc.SetTextForeground(wx.Colour(30, 60, 140))
        dc.DrawText(pct_str, bar_x + bar_w + 6, (h - th) // 2)
