"""
File Server — HTTP server hỗ trợ Range requests cho audio streaming.
Phục vụ file nhạc từ AppData/Local/LofiMusicPlayer/downloads/
"""

import os
import socket
import threading
import urllib.parse
import mimetypes
import http.server
import socketserver


class RangeRequestHandler(http.server.BaseHTTPRequestHandler):
    """HTTP handler hỗ trợ Range requests cho audio seeking."""
    
    # Store storage reference at class level for the handler to access
    storage = None

    def do_GET(self):
        if not self.storage:
            self.send_error(500, "Storage not configured")
            return
            
        path = urllib.parse.unquote(self.path.lstrip('/'))
        filepath = os.path.join(self.storage.downloads_dir, path)

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


class FileServer:
    """Quản lý local HTTP server cho audio streaming."""

    def __init__(self, storage):
        self._storage = storage
        self._port = self._find_free_port()
        self._server = None
        self._thread = None
        
        # Inject storage into handler
        RangeRequestHandler.storage = self._storage

    def _find_free_port(self) -> int:
        s = socket.socket()
        s.bind(('', 0))
        port = s.getsockname()[1]
        s.close()
        return port
        
    @property
    def port(self) -> int:
        return self._port

    def start(self) -> int:
        """Khởi động file server. Trả về port đang lắng nghe."""
        if self._server:
            return self._port
            
        self._server = socketserver.ThreadingTCPServer(('127.0.0.1', self._port), RangeRequestHandler)
        self._server.daemon_threads = True
        self._thread = threading.Thread(target=self._server.serve_forever, daemon=True)
        self._thread.start()
        print(f"[FileServer] Started on port {self._port}")
        return self._port
