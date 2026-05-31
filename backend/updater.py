"""
Auto Update System via GitHub Releases API.
Tải file zip update, giải nén và dùng batch script để ghi đè.
"""

import os
import sys
import json
import zipfile
import threading
import subprocess
import urllib.request
import eel
from version import GITHUB_REPO


class Updater:
    """Quản lý cập nhật phiên bản mới từ GitHub Releases."""

    def __init__(self, current_version: str, storage):
        self._version = current_version
        self._storage = storage
        self._is_checking = False
        self._is_updating = False
        self._expose_eel()

    # ── Public API ─────────────────────────────────────────────────────────────

    def check_on_startup(self):
        """Non-blocking check on app startup — sends result to frontend via eel."""
        result = self.check_for_update()
        if result.get("has_update"):
            try:
                if hasattr(eel, "onUpdateAvailable"):
                    eel.onUpdateAvailable(result)
            except Exception as e:
                print(f"[Updater] Could not notify frontend: {e}")

    def check_for_update(self) -> dict:
        """Check GitHub API for latest release."""
        if self._is_checking:
            return {"has_update": False}

        if not GITHUB_REPO or GITHUB_REPO == "OWNER/REPO":
            return {"has_update": False, "error": "GitHub repo not configured"}

        self._is_checking = True
        try:
            url = f"https://api.github.com/repos/{GITHUB_REPO}/releases/latest"
            req = urllib.request.Request(url, headers={"User-Agent": "LofiMusicPlayer"})
            with urllib.request.urlopen(req, timeout=10) as response:
                data = json.loads(response.read().decode())

            latest_version = data.get("tag_name", "").lstrip("v")
            if not latest_version:
                return {"has_update": False, "error": "Invalid release data"}

            has_update = self._compare_versions(latest_version, self._version) > 0

            # Find zip asset
            assets = data.get("assets", [])
            download_url = None
            for asset in assets:
                if asset.get("name", "").endswith(".zip"):
                    download_url = asset.get("browser_download_url")
                    break

            if has_update and not download_url:
                download_url = data.get("zipball_url")

            return {
                "has_update": has_update,
                "current_version": self._version,
                "latest_version": latest_version,
                "download_url": download_url,
                "release_notes": data.get("body", "Không có thông tin chi tiết."),
            }
        except Exception as e:
            print(f"[Updater] Check error: {e}")
            return {"has_update": False, "error": str(e)}
        finally:
            self._is_checking = False

    def download_and_apply_update(self, url: str) -> bool:
        """Tải bản cập nhật trong background."""
        if self._is_updating:
            return False

        self._is_updating = True
        threading.Thread(target=self._update_worker, args=(url,), daemon=True).start()
        return True

    # ── Internal ───────────────────────────────────────────────────────────────

    def _compare_versions(self, v1: str, v2: str) -> int:
        """Return 1 if v1 > v2, 0 if equal, -1 if v1 < v2."""
        p1 = [int(x) for x in v1.split(".") if x.isdigit()]
        p2 = [int(x) for x in v2.split(".") if x.isdigit()]
        for i in range(max(len(p1), len(p2))):
            n1 = p1[i] if i < len(p1) else 0
            n2 = p2[i] if i < len(p2) else 0
            if n1 > n2:
                return 1
            if n1 < n2:
                return -1
        return 0

    def _update_worker(self, url: str):
        """Worker thread: download → extract → batch script → restart."""
        try:
            cache_dir = self._storage.get_update_cache_dir()
            zip_path = os.path.join(cache_dir, "update.zip")
            extract_dir = os.path.join(cache_dir, "extracted")

            self._send_progress("downloading", 0)

            # 1. Download
            req = urllib.request.Request(url, headers={"User-Agent": "LofiMusicPlayer"})
            with urllib.request.urlopen(req, timeout=60) as response, open(zip_path, "wb") as out_file:
                total_size = int(response.getheader("Content-Length", 0))
                downloaded = 0
                block_size = 1024 * 64

                while True:
                    buffer = response.read(block_size)
                    if not buffer:
                        break
                    out_file.write(buffer)
                    downloaded += len(buffer)
                    if total_size > 0:
                        percent = int((downloaded / total_size) * 100)
                        self._send_progress("downloading", percent)

            # 2. Extract
            self._send_progress("extracting", 100)
            if os.path.exists(extract_dir):
                import shutil
                shutil.rmtree(extract_dir)
            os.makedirs(extract_dir, exist_ok=True)

            with zipfile.ZipFile(zip_path, "r") as zip_ref:
                zip_ref.extractall(extract_dir)

            # GitHub zipballs have a single root folder — unwrap it
            src_dir = extract_dir
            extracted_items = os.listdir(extract_dir)
            if len(extracted_items) == 1 and os.path.isdir(os.path.join(extract_dir, extracted_items[0])):
                src_dir = os.path.join(extract_dir, extracted_items[0])

            # 3. Apply via Batch Script (only for frozen exe)
            self._send_progress("installing", 100)

            if not getattr(sys, "frozen", False):
                self._send_progress("error", 0, "Chỉ có thể cập nhật khi chạy bản build (.exe)")
                self._is_updating = False
                return

            exe_path = sys.executable
            app_dir = os.path.dirname(exe_path)
            pid = os.getpid()
            bat_path = os.path.join(cache_dir, "_updater.bat")

            bat_content = f"""@echo off
title Cap nhat Lofi Music Player
echo Dang cho ung dung dong...
:wait_loop
tasklist /fi "pid eq {pid}" | find "{pid}" >nul
if not errorlevel 1 (
    timeout /t 1 /nobreak >nul
    goto wait_loop
)

echo Dang cai dat ban cap nhat...
xcopy /s /e /y /h /c /i "{src_dir}\\*" "{app_dir}"

echo Dang don dep...
rd /s /q "{extract_dir}"
del /q "{zip_path}"

echo Dang khoi dong lai...
start "" "{exe_path}"

del "%~f0"
"""
            with open(bat_path, "w", encoding="utf-8") as f:
                f.write(bat_content)

            self._send_progress("ready_to_restart", 100)
            eel.sleep(1)

            # Launch batch detached then exit
            subprocess.Popen([bat_path], creationflags=subprocess.CREATE_NO_WINDOW | subprocess.DETACHED_PROCESS)
            os._exit(0)

        except Exception as e:
            print(f"[Updater] Worker error: {e}")
            self._send_progress("error", 0, str(e))
            self._is_updating = False

    def _send_progress(self, status: str, percent: int, error_msg: str = ""):
        """Gửi tiến trình về frontend qua eel."""
        try:
            if hasattr(eel, "updateProgress"):
                eel.updateProgress({"status": status, "percent": percent, "error": error_msg})
        except Exception as e:
            print(f"[Updater] Progress send error: {e}")

    # ── Eel endpoints ──────────────────────────────────────────────────────────

    def _expose_eel(self):
        """Expose update functions cho frontend."""

        @eel.expose
        def check_for_update():
            return self.check_for_update()

        @eel.expose
        def download_and_apply_update(url):
            return self.download_and_apply_update(url)
