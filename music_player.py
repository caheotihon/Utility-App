import os
import sys
import socket
import threading
import http.server
import socketserver
import urllib.parse
import mimetypes
import base64
import eel
from mutagen.mp3 import MP3
from mutagen.id3 import ID3
import yt_dlp
import pystray
from PIL import Image
import win32gui
import win32con
import ctypes

# Fix mờ icon và giao diện trên màn hình DPI cao
try:
    ctypes.windll.shcore.SetProcessDpiAwareness(1)
except Exception:
    ctypes.windll.user32.SetProcessDPIAware()

# --- CẤU HÌNH ĐƯỜNG DẪN ---
# Khi đóng gói PyInstaller: sys._MEIPASS trỏ tới thư mục tạm chứa data bundled
# ROOT_BUNDLE: nơi chứa frontend/dist (bundled data)
# ROOT_APP: nơi chứa exe thực tế (cho downloads, user data)
if getattr(sys, 'frozen', False):
    ROOT_BUNDLE = sys._MEIPASS
    ROOT_APP = os.path.dirname(sys.executable)
else:
    ROOT_BUNDLE = os.path.abspath(os.path.dirname(__file__))
    ROOT_APP = ROOT_BUNDLE

DOWNLOADS = os.path.join(ROOT_APP, 'downloads')
NOTES_DIR = os.path.join(ROOT_APP, 'notes')

for dir_path in [DOWNLOADS, NOTES_DIR]:
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)


# --- FILE SERVER (Stream nhạc cho thẻ <audio>) ---
def find_free_port():
    s = socket.socket()
    s.bind(('', 0))
    port = s.getsockname()[1]
    s.close()
    return port


FILE_SERVER_PORT = find_free_port()


class RangeRequestHandler(http.server.BaseHTTPRequestHandler):
    """HTTP handler hỗ trợ Range requests cho audio seeking."""

    def do_GET(self):
        path = urllib.parse.unquote(self.path.lstrip('/'))
        filepath = os.path.join(DOWNLOADS, path)

        if not os.path.isfile(filepath):
            self.send_error(404, 'File not found')
            return

        file_size = os.path.getsize(filepath)
        content_type = mimetypes.guess_type(filepath)[0] or 'application/octet-stream'
        range_header = self.headers.get('Range')

        try:
            if range_header:
                range_spec = range_header.strip().split('=')[1]
                parts = range_spec.split('-')
                start = int(parts[0]) if parts[0] else 0
                end = int(parts[1]) if parts[1] else file_size - 1

                self.send_response(206)
                self.send_header('Content-Type', content_type)
                self.send_header('Content-Length', str(end - start + 1))
                self.send_header('Content-Range', f'bytes {start}-{end}/{file_size}')
                self.send_header('Accept-Ranges', 'bytes')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()

                with open(filepath, 'rb') as f:
                    f.seek(start)
                    remaining = end - start + 1
                    while remaining > 0:
                        chunk = f.read(min(64 * 1024, remaining))
                        if not chunk:
                            break
                        try:
                            self.wfile.write(chunk)
                        except (ConnectionResetError, BrokenPipeError):
                            break
                        remaining -= len(chunk)
            else:
                self.send_response(200)
                self.send_header('Content-Type', content_type)
                self.send_header('Content-Length', str(file_size))
                self.send_header('Accept-Ranges', 'bytes')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                with open(filepath, 'rb') as f:
                    while True:
                        chunk = f.read(64 * 1024)
                        if not chunk:
                            break
                        try:
                            self.wfile.write(chunk)
                        except (ConnectionResetError, BrokenPipeError):
                            break
        except Exception:
            pass

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Range')
        self.end_headers()

    def log_message(self, format, *args):
        pass  # Tắt log để sạch console


def start_file_server():
    server = socketserver.ThreadingTCPServer(('127.0.0.1', FILE_SERVER_PORT), RangeRequestHandler)
    server.daemon_threads = True
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server


# --- CÁC HÀM EEL EXPOSE ---

@eel.expose
def get_playlist():
    """Trả về danh sách bài hát kèm metadata."""
    files = [f for f in os.listdir(DOWNLOADS) if f.lower().endswith('.mp3')]
    playlist = []
    for f in sorted(files):
        path = os.path.join(DOWNLOADS, f)
        title = os.path.splitext(f)[0]
        artist = "Unknown"
        duration = "0:00"
        cover_b64 = ""
        try:
            audio = MP3(path)
            sec = int(audio.info.length)
            duration = f"{sec // 60}:{sec % 60:02d}"
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

        playlist.append({
            'file': f,
            'title': title,
            'artist': artist,
            'duration': duration,
            'cover': cover_b64,
            'url': f'http://127.0.0.1:{FILE_SERVER_PORT}/{urllib.parse.quote(f)}'
        })
    return playlist

@eel.expose
def delete_song(filename):
    """Xoá một bài hát khỏi thư mục downloads."""
    path = os.path.join(DOWNLOADS, filename)
    if os.path.exists(path):
        try:
            os.remove(path)
            return True
        except Exception as e:
            print(f"[ERROR] Khong the xoa file nhac {filename}: {e}")
    return False
import json

@eel.expose
def get_notes():
    """Lấy danh sách ghi chú từ thư mục notes."""
    notes = []
    if not os.path.exists(NOTES_DIR):
        return []
    
    for filename in os.listdir(NOTES_DIR):
        if filename.endswith('.json'):
            path = os.path.join(NOTES_DIR, filename)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    note = json.load(f)
                    notes.append(note)
            except Exception as e:
                print(f"[ERROR] Khong the doc file ghi chu {filename}: {e}")
    
    # Sắp xếp theo thời gian mới nhất (trên cùng)
    return sorted(notes, key=lambda x: x.get('id', 0), reverse=True)

@eel.expose
def save_all_notes(notes_list):
    """Lưu toàn bộ danh sách ghi chú (dùng để đồng bộ hoặc reorder)."""
    # Xoá các file cũ không còn tồn tại trong list mới
    existing_files = [f for f in os.listdir(NOTES_DIR) if f.endswith('.json')]
    new_ids = [f"{n['id']}.json" for n in notes_list]
    
    for f in existing_files:
        if f not in new_ids:
            try:
                os.remove(os.path.join(NOTES_DIR, f))
            except: pass

    for note in notes_list:
        save_single_note(note)

@eel.expose
def save_single_note(note):
    """Lưu một ghi chú đơn lẻ thành file JSON."""
    filename = f"{note['id']}.json"
    path = os.path.join(NOTES_DIR, filename)
    try:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(note, f, ensure_ascii=False, indent=4)
        return True
    except Exception as e:
        print(f"[ERROR] Khong the luu file ghi chu {filename}: {e}")
        return False

@eel.expose
def delete_single_note(note_id):
    """Xoá file ghi chú theo ID."""
    filename = f"{note_id}.json"
    path = os.path.join(NOTES_DIR, filename)
    if os.path.exists(path):
        try:
            os.remove(path)
            return True
        except Exception as e:
            print(f"[ERROR] Khong the xoa file ghi chu {filename}: {e}")
    return False


def _send_status(msg):
    """Gửi trạng thái download về frontend."""
    print(f"[Python -> Eel] Status: {msg}")
    try:
        # Nếu chưa có attribute, có thể do browser vừa mới khởi động, đợi 0.5s thử lại
        if not hasattr(eel, 'downloadStatus'):
            eel.sleep(0.5)
            
        if hasattr(eel, 'downloadStatus'):
            eel.downloadStatus(msg)
            eel.sleep(0.01)
        else:
            print(f"[WARN] Frontend chua expose 'downloadStatus' sau khi doi. Dang bo qua tin nhan.")
    except Exception as e:
        print(f"[ERROR] Khong the gui status qua Eel: {e}")


@eel.expose
def start_download(urls):
    """Tải nhạc từ danh sách URL YouTube."""
    def process():
        total = len([u for u in urls if u.strip()])
        _send_status(f"⏳ Đang khởi tạo trình tải cho {total} bài hát...")
        
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [
                {'key': 'FFmpegExtractAudio', 'preferredcodec': 'mp3', 'preferredquality': '320'},
                {'key': 'FFmpegMetadata', 'add_metadata': True},
                {'key': 'EmbedThumbnail', 'already_have_thumbnail': False}
            ],
            'writethumbnail': True,
            'outtmpl': os.path.join(DOWNLOADS, '%(title)s.%(ext)s'),
            'quiet': True,
            'noplaylist': True,
        }
        
        completed = 0
        failed = 0
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            for index, url in enumerate(urls, 1):
                if not url.strip():
                    continue
                
                try:
                    # Gửi trạng thái chi tiết kèm chỉ số x/y
                    _send_status(f"⏳ Đang tải bài {index}/{total}...")
                    
                    # Trích xuất thông tin trước khi tải để lấy tiêu đề bài hát (tùy chọn)
                    # info = ydl.extract_info(url, download=True)
                    # title = info.get('title', url[:30])
                    
                    ydl.download([url])
                    completed += 1
                    
                    # Sau khi tải xong 1 bài, gửi thông báo cập nhật
                    _send_status(f"⏳ Đang tải bài {index}/{total} (Xong {completed} bài)...")
                
                except Exception as e:
                    failed += 1
                    _send_status(f"⚠️ Lỗi ở bài {index}: {str(e)[:50]}")

        # THÔNG BÁO CUỐI CÙNG
        if completed == total:
            _send_status(f"✅ Hoàn tất! Đã tải thành công {completed}/{total} bài hát.")
        else:
            _send_status(f"⚠️ Tải xong: {completed} thành công, {failed} thất bại.")

    if not urls:
        _send_status("⚠️ Vui lòng nhập link YouTube.")
        return
        
    threading.Thread(target=process, daemon=True).start()


# --- SYSTEM TRAY & WINDOW MANAGEMENT ---
APP_TITLE = "Lofi Music Player"
tray_icon = None

def get_window_handle():
    return win32gui.FindWindow(None, APP_TITLE)

def show_window(icon, item):
    hwnd = get_window_handle()
    if hwnd:
        win32gui.ShowWindow(hwnd, win32con.SW_SHOW)
        win32gui.ShowWindow(hwnd, win32con.SW_RESTORE)
        win32gui.SetForegroundWindow(hwnd)

def hide_window():
    hwnd = get_window_handle()
    if hwnd:
        win32gui.ShowWindow(hwnd, win32con.SW_HIDE)

def exit_app(icon, item):
    icon.stop()
    os._exit(0)

def setup_tray():
    global tray_icon
    try:
        # Check multiple locations for the icon
        paths_to_check = [
            os.path.join(ROOT_BUNDLE, 'frontend', 'public', 'logo-app.ico'), # Dev
            os.path.join(ROOT_BUNDLE, 'frontend', 'dist', 'logo-app.ico'),   # Prod
            os.path.join(ROOT_BUNDLE, 'logo-app.ico'),                     # Root fallback
        ]
        
        icon_path = None
        for p in paths_to_check:
            if os.path.exists(p):
                icon_path = p
                break
            
        if not icon_path:
            print("[WARN] Icon not found, tray might not start correctly.")
            # Create a simple colored image if icon is missing
            image = Image.new('RGB', (64, 64), color='blue')
        else:
            image = Image.open(icon_path)
        menu = pystray.Menu(
            pystray.MenuItem("Hiện ứng dụng", show_window, default=True),
            pystray.MenuItem("Ẩn xuống Tray", lambda icon, item: hide_window()),
            pystray.MenuItem("Thoát", exit_app)
        )
        tray_icon = pystray.Icon("LofiMusic", image, APP_TITLE, menu)
        tray_icon.run()
    except Exception as e:
        print(f"[ERROR] Tray icon error: {e}")

@eel.expose
def minimize_to_tray():
    hide_window()

# --- CHẠY ỨNG DỤNG ---
if __name__ == '__main__':
    is_dev = '--dev' in sys.argv

    # Xác định thư mục frontend (bundled data)
    FRONTEND_DIST = os.path.join(ROOT_BUNDLE, 'frontend', 'dist')

    print(f"[*] Music Player dang khoi dong...")
    print(f"[*] Thu muc nhac: {DOWNLOADS}")
    print(f"[*] File server: http://127.0.0.1:{FILE_SERVER_PORT}/")

    # Khởi động file server phục vụ MP3
    start_file_server()

    if is_dev:
        # === CHẾ ĐỘ DEVELOPMENT ===
        # Eel chạy trên port 8000, Vite dev server trên port 5173
        # Vite proxy /eel.js về localhost:8000
        print("[DEV] Che do: Development (Vite Hot Reload)")

        # Tạo thư mục tạm nếu chưa có dist (eel.init cần 1 thư mục)
        if not os.path.exists(FRONTEND_DIST):
            os.makedirs(FRONTEND_DIST)

        # CHỈ quét file .html để tránh Eel parse lỗi cú pháp JS bundle
        eel.init(FRONTEND_DIST, allowed_extensions=['.html'])

        try:
            # Start tray in a separate thread
            threading.Thread(target=setup_tray, daemon=True).start()
            
            eel.start('http://localhost:5173', port=8000, size=(1100, 750))
        except EnvironmentError as e:
            print(f"[ERROR] Khong mo duoc trinh duyet: {e}")
    else:
        # === CHẾ ĐỘ PRODUCTION ===
        print("[PROD] Che do: Production")

        if not os.path.exists(FRONTEND_DIST):
            print("[ERROR] Khong tim thay frontend/dist. Hay chay: cd frontend && npm run build")
            sys.exit(1)

        # CHỈ quét file .html để tránh Eel parse lỗi cú pháp JS bundle
        eel.init(FRONTEND_DIST, allowed_extensions=['.html'])

        try:
            # Start tray in a separate thread
            threading.Thread(target=setup_tray, daemon=True).start()
            
            # Start Eel
            eel.start('index.html', port=8000, size=(1100, 750))
        except EnvironmentError as e:
            print(f"[ERROR] Khong mo duoc trinh duyet: {e}")