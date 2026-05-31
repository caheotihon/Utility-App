"""
Storage Manager — quản lý tất cả đường dẫn user data.
Data được lưu tại: AppData/Local/<APP_NAME>/
Hỗ trợ migrate dữ liệu từ thư mục cũ (cạnh exe) lần đầu tiên.
"""

import os
import sys
import shutil



class StorageManager:
    """Centralized path management for all user data."""

    def __init__(self, app_name: str = None, root_app: str = None):
        from version import APP_NAME as DEFAULT_APP_NAME
        _app_name = app_name or DEFAULT_APP_NAME

        # Base directory: AppData/Local/<APP_NAME>/
        self._base = os.path.join(
            os.environ.get("LOCALAPPDATA", os.path.expanduser("~")),
            _app_name,
        )
        # Sub-directories
        self._dirs = {
            "downloads": os.path.join(self._base, "downloads"),
            "settings": os.path.join(self._base, "settings"),
            "playlists": os.path.join(self._base, "playlists"),
            "database": os.path.join(self._base, "database"),
            "cache": os.path.join(self._base, "cache"),
        }
        # Legacy root (thư mục cạnh exe, dùng cho migration)
        if root_app:
            self._legacy_root = root_app
        elif getattr(sys, "frozen", False):
            self._legacy_root = os.path.dirname(sys.executable)
        else:
            self._legacy_root = os.path.abspath(os.path.dirname(__file__))
            self._legacy_root = os.path.dirname(self._legacy_root)  # go up from backend/

        # Bundle root (nơi chứa frontend/dist khi frozen)
        if getattr(sys, "frozen", False):
            self._bundle_root = sys._MEIPASS
        else:
            # Khi dev, legacy_root đã là project root
            self._bundle_root = self._legacy_root

        self.ensure_dirs()
        self.migrate_legacy_data()

    @property
    def base_dir(self) -> str:
        return self._base

    @property
    def downloads_dir(self) -> str:
        return self._dirs["downloads"]

    @property
    def settings_dir(self) -> str:
        return self._dirs["settings"]

    @property
    def playlists_dir(self) -> str:
        return self._dirs["playlists"]

    @property
    def database_dir(self) -> str:
        return self._dirs["database"]

    @property
    def cache_dir(self) -> str:
        return self._dirs["cache"]

    @property
    def legacy_root(self) -> str:
        return self._legacy_root

    @property
    def bundle_root(self) -> str:
        return self._bundle_root

    def ensure_dirs(self):
        """Tạo tất cả thư mục cần thiết nếu chưa tồn tại."""
        for dir_path in self._dirs.values():
            os.makedirs(dir_path, exist_ok=True)
        print(f"[Storage] Data directory: {self._base}")

    def migrate_legacy_data(self):
        """
        Di chuyển dữ liệu từ thư mục cũ (cạnh exe) sang AppData.
        Chỉ chạy 1 lần — tạo marker file sau khi hoàn thành.
        """
        marker = os.path.join(self._base, ".migrated")
        if os.path.exists(marker):
            return  # Đã migrate rồi

        legacy_downloads = os.path.join(self._legacy_root, "downloads")
        if os.path.isdir(legacy_downloads):
            print(f"[Storage] Migrating legacy downloads from: {legacy_downloads}")
            count = 0
            for filename in os.listdir(legacy_downloads):
                src = os.path.join(legacy_downloads, filename)
                dst = os.path.join(self.downloads_dir, filename)
                if os.path.isfile(src) and not os.path.exists(dst):
                    try:
                        shutil.copy2(src, dst)
                        count += 1
                    except Exception as e:
                        print(f"[Storage] Failed to copy {filename}: {e}")
            print(f"[Storage] Migrated {count} files to AppData")

        # Tạo marker file
        try:
            with open(marker, "w") as f:
                f.write("migrated")
        except Exception:
            pass

    def get_settings_file(self) -> str:
        """Đường dẫn đến file settings JSON."""
        return os.path.join(self.settings_dir, "app_settings.json")

    def get_update_cache_dir(self) -> str:
        """Thư mục cache cho auto-update downloads."""
        path = os.path.join(self.cache_dir, "updates")
        os.makedirs(path, exist_ok=True)
        return path
