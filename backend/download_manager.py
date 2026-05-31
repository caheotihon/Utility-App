"""
Download Manager — quản lý hàng đợi tải nhạc từ YouTube.
Sử dụng yt-dlp, lưu MP3 vào AppData downloads directory.
"""

import os
import threading
import eel
import yt_dlp


class DownloadManager:
    """Queue-based YouTube downloader with Eel status reporting."""

    def __init__(self, storage):
        self._storage = storage
        self._queue = []            # Hàng đợi chứa các url cần tải
        self._processed_urls = set()  # Lưu các url đã thêm để kiểm tra trùng lặp
        self._is_downloading = False   # Cờ kiểm tra xem có đang chạy tiến trình tải không
        self._stats = {
            "total": 0,
            "completed": 0,
            "failed": 0,
            "current_index": 0,
            "duplicates": 0,
        }
        self._lock = threading.Lock()
        self._on_complete_callback = None

    def set_on_complete(self, callback):
        """Đặt callback gọi khi tất cả downloads hoàn thành."""
        self._on_complete_callback = callback

    def _send_status(self, msg: str):
        """Gửi trạng thái download về frontend."""
        print(f"[Download -> Eel] Status: {msg}")
        try:
            if not hasattr(eel, "downloadStatus"):
                eel.sleep(0.5)

            if hasattr(eel, "downloadStatus"):
                eel.downloadStatus(msg)
                eel.sleep(0.01)
            else:
                print("[WARN] Frontend chưa expose 'downloadStatus'. Bỏ qua.")
        except Exception as e:
            print(f"[ERROR] Không thể gửi status qua Eel: {e}")

    def _process_queue(self):
        """Worker thread: tải lần lượt từng URL trong queue."""
        downloads_dir = self._storage.downloads_dir

        ydl_opts = {
            "format": "bestaudio/best",
            "postprocessors": [
                {"key": "FFmpegExtractAudio", "preferredcodec": "mp3", "preferredquality": "320"},
                {"key": "FFmpegMetadata", "add_metadata": True},
                {"key": "EmbedThumbnail", "already_have_thumbnail": False},
            ],
            "writethumbnail": True,
            "outtmpl": os.path.join(downloads_dir, "%(title)s.%(ext)s"),
            "quiet": True,
            "noplaylist": True,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            while True:
                with self._lock:
                    if not self._queue:
                        self._is_downloading = False
                        break
                    url = self._queue.pop(0)
                    self._stats["current_index"] += 1

                index = self._stats["current_index"]
                total = self._stats["total"]

                self._send_status(f"⏳ Đang tải bài {index}/{total}...")

                try:
                    ydl.download([url])
                    with self._lock:
                        self._stats["completed"] += 1
                    completed = self._stats["completed"]
                    self._send_status(f"⏳ Đang tải bài {index}/{total} (Xong {completed} bài)...")
                except Exception as e:
                    with self._lock:
                        self._stats["failed"] += 1
                    self._send_status(f"⚠️ Lỗi ở bài {index}: {str(e)[:50]}")
                    eel.sleep(1)

        # Tất cả đã xong
        total = self._stats["total"]
        completed = self._stats["completed"]
        failed = self._stats["failed"]
        duplicates = self._stats["duplicates"]

        dup_text = f" (bỏ qua {duplicates} link trùng)" if duplicates > 0 else ""

        if completed == total and total > 0:
            self._send_status(f"✅ Hoàn tất! Đã tải thành công {completed}/{total} bài hát{dup_text}.")
        elif total > 0:
            self._send_status(f"✅ Hoàn tất tải: {completed} thành công, {failed} thất bại{dup_text}.")

        # Reset stats
        with self._lock:
            self._stats = {"total": 0, "completed": 0, "failed": 0, "current_index": 0, "duplicates": 0}
            self._processed_urls.clear()

        # Gọi callback
        if self._on_complete_callback:
            try:
                self._on_complete_callback()
            except Exception:
                pass

    def expose_eel(self):
        """Expose download functions cho frontend."""

        @eel.expose
        def start_download(urls):
            new_urls = [u.strip() for u in urls if u.strip()]
            if not new_urls:
                self._send_status("⚠️ Vui lòng nhập link YouTube.")
                return

            added_count = 0
            with self._lock:
                for url in new_urls:
                    if url in self._processed_urls:
                        self._stats["duplicates"] += 1
                    else:
                        self._processed_urls.add(url)
                        self._queue.append(url)
                        self._stats["total"] += 1
                        added_count += 1

            with self._lock:
                if not self._is_downloading and self._queue:
                    self._is_downloading = True
                    threading.Thread(target=self._process_queue, daemon=True).start()
                else:
                    if added_count > 0:
                        self._send_status(f"⏳ Đã thêm vào hàng đợi. Tổng bài: {self._stats['total']}")
