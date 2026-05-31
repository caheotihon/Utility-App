"""
Music Library — đọc thông tin file MP3 từ thư mục downloads.
Trả về danh sách playlist cơ sở và hỗ trợ sắp xếp.
"""

import os
import base64
import urllib.parse
from mutagen.mp3 import MP3
from mutagen.id3 import ID3
import eel


class MusicLibrary:
    """Quản lý đọc và parse metadata các file MP3."""

    def __init__(self, storage, file_server_port: int = 0):
        self._storage = storage
        self._port = file_server_port

    def set_file_server_port(self, port: int):
        """Cập nhật port sau khi file server đã start."""
        self._port = port

    def get_song_metadata(self, filename: str) -> dict:
        """Đọc metadata (ID3 tags) của 1 file MP3."""
        path = os.path.join(self._storage.downloads_dir, filename)
        title = os.path.splitext(filename)[0]
        artist = "Unknown"
        duration = "0:00"
        duration_sec = 0
        cover_b64 = ""
        
        try:
            if os.path.exists(path):
                audio = MP3(path)
                duration_sec = int(audio.info.length)
                duration = f"{duration_sec // 60}:{duration_sec % 60:02d}"
                
                tags = ID3(path)
                if 'TIT2' in tags:
                    title = str(tags.get('TIT2'))
                if 'TPE1' in tags:
                    artist = str(tags.get('TPE1'))
                apics = tags.getall('APIC')
                if apics:
                    cover_b64 = f"data:{apics[0].mime};base64," + base64.b64encode(apics[0].data).decode('utf-8')
        except Exception:
            pass

        # Parse create time for sorting
        created_time = 0
        try:
            if os.path.exists(path):
                created_time = os.path.getctime(path)
        except Exception:
            pass

        return {
            'file': filename,
            'title': title,
            'artist': artist,
            'duration': duration,
            'duration_sec': duration_sec,
            'cover': cover_b64,
            'url': f'http://127.0.0.1:{self._port}/{urllib.parse.quote(filename)}',
            'created_time': created_time
        }

    def get_all_songs(self) -> list:
        """Trả về toàn bộ danh sách file nhạc trong thư mục downloads."""
        downloads_dir = self._storage.downloads_dir
        if not os.path.exists(downloads_dir):
            return []
            
        files = [f for f in os.listdir(downloads_dir) if f.lower().endswith('.mp3')]
        playlist = []
        
        for f in files:
            metadata = self.get_song_metadata(f)
            playlist.append(metadata)
            
        return playlist

    def delete_song(self, filename: str) -> bool:
        """Xoá một file bài hát."""
        path = os.path.join(self._storage.downloads_dir, filename)
        if os.path.exists(path):
            try:
                os.remove(path)
                return True
            except Exception as e:
                print(f"[ERROR] Không thể xoá file nhạc {filename}: {e}")
        return False

    def expose_eel(self, playlist_manager):
        """Expose functions cho frontend."""
        
        @eel.expose
        def get_playlist(sort_by="newest"):
            """
            Lấy toàn bộ bài hát, hỗ trợ sort.
            sort_by: newest, oldest, title_asc, title_desc, artist, duration
            """
            songs = self.get_all_songs()
            
            if sort_by == "newest":
                songs.sort(key=lambda x: x['created_time'], reverse=True)
            elif sort_by == "oldest":
                songs.sort(key=lambda x: x['created_time'])
            elif sort_by == "title_asc":
                songs.sort(key=lambda x: x['title'].lower())
            elif sort_by == "title_desc":
                songs.sort(key=lambda x: x['title'].lower(), reverse=True)
            elif sort_by == "artist":
                songs.sort(key=lambda x: x['artist'].lower())
            elif sort_by == "duration":
                songs.sort(key=lambda x: x['duration_sec'], reverse=True)
                
            return songs
            
        @eel.expose
        def get_playlist_songs(playlist_id):
            """Lấy thông tin chi tiết các bài hát trong 1 playlist cụ thể."""
            pl = playlist_manager.get_playlist(playlist_id)
            if not pl:
                return []
                
            songs = []
            for filename in pl.get("songs", []):
                songs.append(self.get_song_metadata(filename))
            return songs

        @eel.expose
        def delete_song(filename):
            """Xóa bài hát khỏi ổ đĩa và khỏi tất cả playlist."""
            success = self.delete_song(filename)
            if success:
                # Tìm và xóa bài này khỏi các playlist chứa nó
                for pid in playlist_manager.get_playlists_for_song(filename):
                    playlist_manager.remove_song(pid, filename)
            return success
