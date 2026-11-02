import wx

_GREEN  = wx.Colour(30, 160, 60)
_RED    = wx.Colour(200, 40, 40)
_ORANGE = wx.Colour(200, 130, 0)
_DARK   = wx.Colour(30, 30, 30)

_MACHINE_ATTRS = {
    "InkMachine":     ["password", "status", "fb", "oil", "process_time", "ink"],
    "HoloMachine":    ["password", "status", "fb", "oil", "process_time", "filled"],
    "LogoMachine":    ["password", "status", "fb", "oil", "process_time", "loc"],
    "CuttingMachine": ["password", "status", "fb", "oil", "process_time", "loc"],
}


class AdminDashboard(wx.Frame):
    ADMIN_PASSWORD = "rootroot"

    def __init__(self, parent, machines: dict, error_ref: list):
        super().__init__(
            parent,
            title="Admin Dashboard",
            size=(760, 420),
            style=wx.DEFAULT_FRAME_STYLE & ~wx.RESIZE_BORDER,
        )
        self._machines = machines
        self._error_ref = error_ref
        self._value_labels: dict = {}
        self.SetBackgroundColour(wx.Colour(235, 240, 252))
        self._build_ui()
        self._timer = wx.Timer(self)
        self.Bind(wx.EVT_TIMER, self._on_tick, self._timer)
        self.Bind(wx.EVT_CLOSE, self._on_close)
        self._timer.Start(500)
        self.Center()

    def _build_ui(self):
        root = wx.BoxSizer(wx.HORIZONTAL)

        for machine_name, attrs in _MACHINE_ATTRS.items():
            machine = self._machines.get(machine_name)
            box = wx.StaticBox(self, label=machine_name)
            box.SetFont(wx.Font(9, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD))
            sizer = wx.StaticBoxSizer(box, wx.VERTICAL)

            for attr in attrs:
                row = wx.BoxSizer(wx.HORIZONTAL)
                lbl = wx.StaticText(self, label=f"{attr}")
                lbl.SetFont(wx.Font(9, wx.FONTFAMILY_TELETYPE, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))
                lbl.SetForegroundColour(wx.Colour(80, 80, 100))

                val = wx.StaticText(self, label="-", size=(52, -1))
                val.SetFont(wx.Font(10, wx.FONTFAMILY_TELETYPE, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD))

                row.Add(lbl, 1, wx.ALIGN_CENTER_VERTICAL)
                row.Add(val, 0, wx.ALIGN_CENTER_VERTICAL | wx.LEFT, 6)
                sizer.Add(row, 0, wx.EXPAND | wx.LEFT | wx.RIGHT | wx.TOP, 6)
                self._value_labels[(machine_name, attr)] = val

            root.Add(sizer, 1, wx.EXPAND | wx.ALL, 8)

        # Error section
        error_box = wx.StaticBox(self, label="오류")
        error_box.SetFont(wx.Font(9, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD))
        error_sizer = wx.StaticBoxSizer(error_box, wx.VERTICAL)
        self._error_label = wx.StaticText(self, label="없음")
        self._error_label.SetFont(wx.Font(9, wx.FONTFAMILY_TELETYPE, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_NORMAL))
        self._error_label.SetForegroundColour(_GREEN)
        error_sizer.Add(self._error_label, 0, wx.ALL, 6)

        fix_all_btn = wx.Button(self, label="Fix All", size=(-1, 36))
        fix_all_btn.SetFont(wx.Font(11, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD))
        fix_all_btn.SetBackgroundColour(wx.Colour(30, 160, 60))
        fix_all_btn.SetForegroundColour(wx.WHITE)
        fix_all_btn.Bind(wx.EVT_BUTTON, self._on_fix_all)

        outer = wx.BoxSizer(wx.VERTICAL)
        outer.Add(root, 0, wx.EXPAND)
        outer.Add(error_sizer, 0, wx.EXPAND | wx.LEFT | wx.RIGHT, 8)
        outer.Add(fix_all_btn, 0, wx.EXPAND | wx.ALL, 8)

        self.SetSizer(outer)
        self._refresh()

    def _refresh(self):
        for (machine_name, attr), label in self._value_labels.items():
            machine = self._machines.get(machine_name)
            if machine is None:
                continue
            val = getattr(machine, attr, "N/A")
            label.SetLabel(str(val))
            label.SetForegroundColour(self._colour_for(attr, val))

        err = self._error_ref[0]
        if err:
            self._error_label.SetLabel(err)
            self._error_label.SetForegroundColour(_RED)
        else:
            self._error_label.SetLabel("없음")
            self._error_label.SetForegroundColour(_GREEN)

        self.Refresh()

    def _colour_for(self, attr: str, val) -> wx.Colour:
        if attr == "password":
            return _DARK
        if attr in ("status", "fb", "oil", "ink", "filled"):
            return _GREEN if val == 1 else _RED
        if attr == "loc":
            if val == 1:
                return _GREEN
            if val == 0:
                return _RED
            return _ORANGE
        if attr == "process_time":
            return _GREEN if val <= 5 else _ORANGE
        return _DARK

    def _on_fix_all(self, _evt):
        for m in self._machines.values():
            m.fb = 1
            m.oil = 1
            m.process_time = 5
        ink = self._machines.get("InkMachine")
        if ink:
            ink.ink = 1
        holo = self._machines.get("HoloMachine")
        if holo:
            holo.filled = 1
        logo = self._machines.get("LogoMachine")
        if logo:
            logo.loc = 1
        cut = self._machines.get("CuttingMachine")
        if cut:
            cut.loc = 1
        self._error_ref[0] = ""
        self._refresh()

    def _on_tick(self, _evt):
        self._refresh()

    def _on_close(self, evt):
        self._timer.Stop()
        evt.Skip()
