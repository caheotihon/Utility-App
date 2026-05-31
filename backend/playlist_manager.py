"""
Playlist Manager — CRUD playlists, persist dưới dạng JSON files.
Mỗi playlist = 1 file JSON trong: AppData/Local/LofiMusicPlayer/playlists/
"""

import os
import json
import uuid
import time
import eel


class PlaylistManager:
    """Quản lý playlist CRUD với JSON persistence."""

    def __init__(self, storage):
        self._storage = storage
        self._playlists = {}  # { id: playlist_data }
        self._load_all()

    def _playlist_path(self, playlist_id: str) -> str:
        """Đường dẫn file JSON cho 1 playlist."""
        return os.path.join(self._storage.playlists_dir, f"{playlist_id}.json")

    def _load_all(self):
        """Load tất cả playlists từ thư mục playlists/."""
        playlists_dir = self._storage.playlists_dir
        if not os.path.isdir(playlists_dir):
            return

        count = 0
        for filename in os.listdir(playlists_dir):
            if not filename.endswith(".json"):
                continue
            filepath = os.path.join(playlists_dir, filename)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                playlist_id = data.get("id", filename.replace(".json", ""))
                self._playlists[playlist_id] = data
                count += 1
            except Exception as e:
                print(f"[Playlist] Error loading {filename}: {e}")

        print(f"[Playlist] Loaded {count} playlists")

    def _save_playlist(self, playlist_id: str):
        """Ghi 1 playlist ra file JSON."""
        data = self._playlists.get(playlist_id)
        if not data:
            return
        path = self._playlist_path(playlist_id)
        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"[Playlist] Error saving {playlist_id}: {e}")

    def _delete_playlist_file(self, playlist_id: str):
        """Xóa file JSON của playlist."""
        path = self._playlist_path(playlist_id)
        try:
            if os.path.exists(path):
                os.remove(path)
        except Exception as e:
            print(f"[Playlist] Error deleting file {playlist_id}: {e}")

    def get_all(self) -> list:
        """Trả về danh sách tất cả playlists (metadata, không kèm full song list)."""
        result = []
        for pid, data in self._playlists.items():
            result.append({
                "id": pid,
                "name": data.get("name", "Untitled"),
                "song_count": len(data.get("songs", [])),
                "created_at": data.get("created_at", 0),
                "updated_at": data.get("updated_at", 0),
            })
        # Sắp xếp theo updated_at mới nhất
        result.sort(key=lambda x: x["updated_at"], reverse=True)
        return result

    def get_playlist(self, playlist_id: str) -> dict | None:
        """Trả về full data của 1 playlist (bao gồm song list)."""
        return self._playlists.get(playlist_id)

    def create(self, name: str) -> dict:
        """Tạo playlist mới, trả về playlist data."""
        playlist_id = str(uuid.uuid4())[:8]
        now = time.time()
        data = {
            "id": playlist_id,
            "name": name.strip() or "Playlist mới",
            "songs": [],
            "created_at": now,
            "updated_at": now,
        }
        self._playlists[playlist_id] = data
        self._save_playlist(playlist_id)
        print(f"[Playlist] Created: {name} ({playlist_id})")
        return data

    def rename(self, playlist_id: str, new_name: str) -> bool:
        """Đổi tên playlist."""
        if playlist_id not in self._playlists:
            return False
        self._playlists[playlist_id]["name"] = new_name.strip()
        self._playlists[playlist_id]["updated_at"] = time.time()
        self._save_playlist(playlist_id)
        return True

    def delete(self, playlist_id: str) -> bool:
        """Xóa playlist."""
        if playlist_id not in self._playlists:
            return False
        del self._playlists[playlist_id]
        self._delete_playlist_file(playlist_id)
        print(f"[Playlist] Deleted: {playlist_id}")
        return True

    def add_song(self, playlist_id: str, song_file: str) -> bool:
        """Thêm bài hát vào playlist (tránh trùng)."""
        playlist = self._playlists.get(playlist_id)
        if not playlist:
            return False
        if song_file in playlist["songs"]:
            return False  # Đã có rồi
        playlist["songs"].append(song_file)
        playlist["updated_at"] = time.time()
        self._save_playlist(playlist_id)
        return True

    def remove_song(self, playlist_id: str, song_file: str) -> bool:
        """Xóa bài hát khỏi playlist."""
        playlist = self._playlists.get(playlist_id)
        if not playlist or song_file not in playlist["songs"]:
            return False
        playlist["songs"].remove(song_file)
        playlist["updated_at"] = time.time()
        self._save_playlist(playlist_id)
        return True

    def reorder_songs(self, playlist_id: str, ordered_files: list) -> bool:
        """Sắp xếp lại thứ tự bài hát trong playlist (sau drag & drop)."""
        playlist = self._playlists.get(playlist_id)
        if not playlist:
            return False
        # Validate: ordered_files phải chứa đúng các file hiện có
        current_set = set(playlist["songs"])
        new_set = set(ordered_files)
        if current_set != new_set:
            return False  # Mismatch — reject
        playlist["songs"] = ordered_files
        playlist["updated_at"] = time.time()
        self._save_playlist(playlist_id)
        return True

    def add_song_to_multiple(self, song_file: str, playlist_ids: list) -> dict:
        """Thêm 1 bài hát vào nhiều playlists cùng lúc."""
        results = {}
        for pid in playlist_ids:
            results[pid] = self.add_song(pid, song_file)
        return results

    def get_playlists_for_song(self, song_file: str) -> list:
        """Trả về danh sách playlist IDs chứa bài hát này."""
        result = []
        for pid, data in self._playlists.items():
            if song_file in data.get("songs", []):
                result.append(pid)
        return result

    def expose_eel(self):
        """Expose các functions cho frontend gọi qua Eel."""

        @eel.expose
        def get_all_playlists():
            return self.get_all()

        @eel.expose
        def get_playlist_detail(playlist_id):
            return self.get_playlist(playlist_id)

        @eel.expose
        def create_playlist(name):
            return self.create(name)

        @eel.expose
        def rename_playlist(playlist_id, new_name):
            return self.rename(playlist_id, new_name)

        @eel.expose
        def delete_playlist(playlist_id):
            return self.delete(playlist_id)

        @eel.expose
        def add_song_to_playlist(playlist_id, song_file):
            return self.add_song(playlist_id, song_file)

        @eel.expose
        def remove_song_from_playlist(playlist_id, song_file):
            return self.remove_song(playlist_id, song_file)

        @eel.expose
        def reorder_playlist_songs(playlist_id, ordered_files):
            return self.reorder_songs(playlist_id, ordered_files)

        @eel.expose
        def add_song_to_multiple_playlists(song_file, playlist_ids):
            return self.add_song_to_multiple(song_file, playlist_ids)

        @eel.expose
        def get_playlists_containing_song(song_file):
            return self.get_playlists_for_song(song_file)
