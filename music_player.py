"""
Lofi Music Player — Main Entry Point (thin orchestrator).
Delegates all logic to backend/ modules.
"""

import os
import sys
import inspect
import threading
import ctypes
import eel

from version import APP_NAME, APP_VERSION, APP_TITLE
from backend.storage_manager import StorageManager
from backend.settings_manager import SettingsManager
from backend.download_manager import DownloadManager
from backend.file_server import FileServer
from backend.music_library import MusicLibrary
from backend.tray_manager import TrayManager
from backend.playlist_manager import PlaylistManager
from backend.updater import Updater

# ── DPI Awareness (Windows only) ──────────────────────────────────────────────
try:
    ctypes.windll.shcore.SetProcessDpiAwareness(1)
except Exception:
    try:
        ctypes.windll.user32.SetProcessDPIAware()
    except Exception:
        pass

# ── Paths ─────────────────────────────────────────────────────────────────────
if getattr(sys, 'frozen', False):
    ROOT_BUNDLE = sys._MEIPASS
    ROOT_APP    = os.path.dirname(sys.executable)
else:
    ROOT_BUNDLE = os.path.abspath(os.path.dirname(__file__))
    ROOT_APP    = ROOT_BUNDLE

# ── Bootstrap backend services ────────────────────────────────────────────────
storage  = StorageManager(APP_NAME, ROOT_APP)
settings = SettingsManager(storage)
library  = MusicLibrary(storage)
playlist = PlaylistManager(storage)
downloader = DownloadManager(storage)
file_server = FileServer(storage)
tray     = TrayManager(APP_TITLE, ROOT_BUNDLE)
updater  = Updater(APP_VERSION, storage)

FILE_SERVER_PORT = file_server.start()

# Re-inject port so library can build correct stream URLs
library.set_file_server_port(FILE_SERVER_PORT)

# ── Expose all Eel endpoints ──────────────────────────────────────────────────
settings.expose_eel()
library.expose_eel(playlist)
playlist.expose_eel()
downloader.expose_eel()
# Note: tray eel endpoints registered in TrayManager.__init__
# Note: updater eel endpoints registered in Updater.__init__

# ── App version exposed to frontend ───────────────────────────────────────────
@eel.expose
def get_app_version():
    return APP_VERSION

# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    is_dev = '--dev' in sys.argv

    FRONTEND_DIST   = os.path.join(ROOT_BUNDLE, 'frontend', 'dist')
    WINDOW_SIZE     = (1100, 750)

    # Compute centered window position
    pos = tray.get_center_position(WINDOW_SIZE)

    eel_start_kwargs = {"port": 8000, "size": WINDOW_SIZE}
    if pos:
        try:
            if "position" in inspect.signature(eel.start).parameters:
                eel_start_kwargs["position"] = pos
        except Exception:
            eel_start_kwargs["position"] = pos

    print(f"[*] {APP_TITLE} v{APP_VERSION} starting...")
    print(f"[*] Downloads: {storage.downloads_dir}")
    print(f"[*] File server: http://127.0.0.1:{FILE_SERVER_PORT}/")

    if is_dev:
        print("[DEV] Mode: Development (Vite Hot Reload)")
        if not os.path.exists(FRONTEND_DIST):
            os.makedirs(FRONTEND_DIST)
        eel.init(FRONTEND_DIST, allowed_extensions=['.html'])
        try:
            threading.Thread(target=tray.run, daemon=True).start()
            # Check for updates on startup (non-blocking)
            threading.Thread(target=updater.check_on_startup, daemon=True).start()
            eel.start('http://localhost:5173', **eel_start_kwargs)
        except EnvironmentError as e:
            print(f"[ERROR] Cannot open browser: {e}")
    else:
        print("[PROD] Mode: Production")
        if not os.path.exists(FRONTEND_DIST):
            print("[ERROR] frontend/dist not found. Run: cd frontend && npm run build")
            sys.exit(1)
        eel.init(FRONTEND_DIST, allowed_extensions=['.html'])
        try:
            threading.Thread(target=tray.run, daemon=True).start()
            # Check for updates on startup (non-blocking)
            threading.Thread(target=updater.check_on_startup, daemon=True).start()
            eel.start('index.html', **eel_start_kwargs)
        except EnvironmentError as e:
            print(f"[ERROR] Cannot open browser: {e}")
