# -*- mode: python ; coding: utf-8 -*-
from PyInstaller.utils.hooks import collect_all

block_cipher = None

wx_datas, wx_binaries, wx_hiddenimports = collect_all('wx')

a = Analysis(
    ['main.py'],
    pathex=['.'],
    binaries=wx_binaries,
    datas=[
        ('resultImage', 'resultImage'),
        ('processImage', 'processImage'),
        ('design', 'design'),
        ('logo.png', '.'),
    ] + wx_datas,
    hiddenimports=wx_hiddenimports + ['wx', 'wx._core', 'wx._html2'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='CardFactorySimulator',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='logo.png',
)
