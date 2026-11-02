import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import wx
from screens.main_screen import MainScreen


def main():
    app = wx.App(False)
    frame = MainScreen()
    frame.Show()
    app.MainLoop()


if __name__ == "__main__":
    main()
