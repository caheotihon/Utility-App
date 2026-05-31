"""
Settings Manager — load/save user settings từ JSON file.
Settings được lưu tại: AppData/Local/LofiMusicPlayer/settings/app_settings.json
"""

import json
import eel


# Default settings — dùng khi chưa có file hoặc key bị thiếu
_DEFAULTS = {
    "volume": 0.9,
    "theme": "dark",
    "last_track_file": None,
    "last_track_index": -1,
    "mini_player": False,
    "shuffle": False,
    "repeat_mode": "off",
    "favorites": [],
}


class SettingsManager:
    """Quản lý user settings với JSON persistence."""

    def __init__(self, storage):
        self._storage = storage
        self._settings = dict(_DEFAULTS)
        self._load()

    def _load(self):
        """Load settings từ file, merge với defaults."""
        path = self._storage.get_settings_file()
        try:
            with open(path, "r", encoding="utf-8") as f:
                saved = json.load(f)
            # Merge: giữ defaults cho keys bị thiếu
            for key, default_val in _DEFAULTS.items():
                self._settings[key] = saved.get(key, default_val)
            print(f"[Settings] Loaded from {path}")
        except FileNotFoundError:
            print("[Settings] No settings file found, using defaults")
        except Exception as e:
            print(f"[Settings] Error loading settings: {e}")

    def _save(self):
        """Ghi settings ra file JSON."""
        path = self._storage.get_settings_file()
        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(self._settings, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"[Settings] Error saving settings: {e}")

    def get_all(self) -> dict:
        """Trả về copy of all settings."""
        return dict(self._settings)

    def get(self, key: str, default=None):
        """Lấy 1 setting theo key."""
        return self._settings.get(key, default)

    def set(self, key: str, value):
        """Cập nhật 1 setting và save."""
        self._settings[key] = value
        self._save()

    def update(self, data: dict):
        """Cập nhật nhiều settings cùng lúc và save."""
        self._settings.update(data)
        self._save()

    def expose_eel(self):
        """Expose các functions cho frontend gọi qua Eel."""

        @eel.expose
        def get_settings():
            return self.get_all()

        @eel.expose
        def save_settings(data):
            self.update(data)
            return True

        @eel.expose
        def get_setting(key):
            return self.get(key)

        @eel.expose
        def save_setting(key, value):
            self.set(key, value)
            return True
