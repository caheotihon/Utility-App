"""
Backend package for Lofi Music Player.
Modular architecture: each file handles one concern.
"""

from backend.storage_manager import StorageManager
from backend.file_server import FileServer
from backend.music_library import MusicLibrary
from backend.download_manager import DownloadManager
from backend.playlist_manager import PlaylistManager
from backend.settings_manager import SettingsManager
from backend.tray_manager import TrayManager
from backend.updater import Updater

__all__ = [
    "StorageManager",
    "FileServer",
    "MusicLibrary",
    "DownloadManager",
    "PlaylistManager",
    "SettingsManager",
    "TrayManager",
    "Updater",
]
