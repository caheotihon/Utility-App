"""
Tray Manager — quản lý System Tray (pystray) và Window manipulations.
"""

import os
import ctypes
from ctypes import wintypes
import threading
from PIL import Image
import pystray
import win32gui
import win32con
import eel


class TrayManager:
    """Quản lý System Tray và Cửa sổ ứng dụng (Windows)."""

    def __init__(self, app_title: str, bundle_root: str):
        self._app_title = app_title
        self._bundle_root = bundle_root
        self._tray_icon = None
        self._expose_eel()

    # ── Window helpers ─────────────────────────────────────────────────────────

    def get_window_handle(self):
        """Lấy window handle bằng win32gui."""
        return win32gui.FindWindow(None, self._app_title)

    def show_window(self, icon=None, item=None):
        """Hiện cửa sổ ứng dụng."""
        hwnd = self.get_window_handle()
        if hwnd:
            win32gui.ShowWindow(hwnd, win32con.SW_SHOW)
            win32gui.ShowWindow(hwnd, win32con.SW_RESTORE)
            win32gui.SetForegroundWindow(hwnd)

    def hide_window(self):
        """Ẩn cửa sổ ứng dụng xuống Tray."""
        hwnd = self.get_window_handle()
        if hwnd:
            win32gui.ShowWindow(hwnd, win32con.SW_HIDE)

    def exit_app(self, icon=None, item=None):
        """Thoát ứng dụng."""
        if self._tray_icon:
            self._tray_icon.stop()
        os._exit(0)

    # ── Tray ───────────────────────────────────────────────────────────────────

    def run(self):
        """Chạy pystray (blocking — gọi từ thread riêng)."""
        try:
            paths_to_check = [
                os.path.join(self._bundle_root, 'frontend', 'public', 'logo-app.ico'),
                os.path.join(self._bundle_root, 'frontend', 'dist', 'logo-app.ico'),
                os.path.join(self._bundle_root, 'logo-app.ico'),
            ]

            icon_path = next((p for p in paths_to_check if os.path.exists(p)), None)

            if not icon_path:
                print("[WARN] Tray icon not found, using fallback.")
                image = Image.new('RGB', (64, 64), color=(59, 130, 246))
            else:
                image = Image.open(icon_path)

            menu = pystray.Menu(
                pystray.MenuItem("Hiện ứng dụng", self.show_window, default=True),
                pystray.MenuItem("Ẩn xuống Tray", lambda icon, item: self.hide_window()),
                pystray.MenuItem("Thoát", self.exit_app)
            )
            self._tray_icon = pystray.Icon("LofiMusic", image, self._app_title, menu)
            self._tray_icon.run()
        except Exception as e:
            print(f"[ERROR] Tray icon error: {e}")

    # ── Window positioning ─────────────────────────────────────────────────────

    def get_bottom_right_position(self, window_size):
        """Tính (x, y) để đặt cửa sổ ở góc dưới phải màn hình."""
        try:
            window_width, window_height = window_size
            SPI_GETWORKAREA = 0x0030
            rect = wintypes.RECT()
            if ctypes.windll.user32.SystemParametersInfoW(SPI_GETWORKAREA, 0, ctypes.byref(rect), 0):
                x = rect.right - window_width - 10
                y = rect.bottom - window_height - 10
                return (x, y)
            return (100, 100)
        except Exception:
            return (100, 100)

    def get_center_position(self, window_size):
        """Tính (x, y) để đặt cửa sổ ở giữa màn hình."""
        try:
            window_width, window_height = window_size
            SPI_GETWORKAREA = 0x0030
            rect = wintypes.RECT()
            if ctypes.windll.user32.SystemParametersInfoW(SPI_GETWORKAREA, 0, ctypes.byref(rect), 0):
                work_width = rect.right - rect.left
                work_height = rect.bottom - rect.top
                x = rect.left + max(0, (work_width - window_width) // 2)
                y = rect.top + max(0, (work_height - window_height) // 2)
                return (x, y)

            user32 = ctypes.windll.user32
            screen_width = user32.GetSystemMetrics(0)
            screen_height = user32.GetSystemMetrics(1)
            x = max(0, (screen_width - window_width) // 2)
            y = max(0, (screen_height - window_height) // 2)
            return (x, y)
        except Exception:
            return None

    # ── Eel endpoints ──────────────────────────────────────────────────────────

    def _expose_eel(self):
        """Expose functions cho frontend."""

        @eel.expose
        def set_always_on_top(is_on_top):
            hwnd = self.get_window_handle()
            if hwnd:
                flag = win32con.HWND_TOPMOST if is_on_top else win32con.HWND_NOTOPMOST
                win32gui.SetWindowPos(hwnd, flag, 0, 0, 0, 0, win32con.SWP_NOMOVE | win32con.SWP_NOSIZE)

        @eel.expose
        def resize_window(width, height, position='center'):
            hwnd = self.get_window_handle()
            if hwnd:
                if position == 'bottom-right':
                    new_x, new_y = self.get_bottom_right_position((width, height))
                else:
                    new_x, new_y = self.get_center_position((width, height)) or (100, 100)
                win32gui.MoveWindow(hwnd, new_x, new_y, width, height, True)

        @eel.expose
        def minimize_to_tray():
            self.hide_window()
