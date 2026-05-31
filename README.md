# Lofi Music Player

Desktop music player built with Python, Eel, React, and Vite.  
The app can:

- Play local/downloaded MP3 files
- Download music from YouTube
- Manage playlists
- Show cover art and playback UI
- Package as a Windows `.exe`

## Project Structure

- `music_player.py` - main Python entry point
- `backend/` - storage, downloads, playlists, file server, updater
- `frontend/` - React UI
- `version.py` - app metadata and version source of truth
- `music_player.spec` - PyInstaller build spec

## Requirements

- Python 3.11+ recommended
- Node.js 18+ recommended
- FFmpeg available in `PATH` for audio download conversion
- Windows for the tray/updater flow and packaged `.exe`

## Install

### 1. Python dependencies

```powershell
python -m pip install -r requirements.txt
```

### 2. Frontend dependencies

```powershell
cd frontend
npm install
```

## Run in Development

Build the frontend first:

```powershell
cd frontend
npm run build
```

Then run the Python app:

```powershell
cd ..
python music_player.py
```

Notes:

- In dev mode, the Python app can also point to the Vite dev server.
- The production Python entry point uses `frontend/dist`.

## Build Frontend Only

```powershell
cd frontend
npm run build
```

This outputs the production UI to `frontend/dist`.

## Build Windows EXE

1. Build the frontend:

```powershell
cd frontend
npm run build
```

2. Build the package:

```powershell
cd ..
python -m PyInstaller .\music_player.spec
```

The packaged app will be created in:

```text
dist\LofiMusicPlayer\
```

Run it with:

```powershell
.\dist\LofiMusicPlayer\LofiMusicPlayer.exe
```

## Version and Auto Update

The app version is defined in `version.py`:

- `APP_VERSION` - current app version
- `APP_NAME` - app folder name
- `APP_TITLE` - display title
- `GITHUB_REPO` - GitHub repository used by the updater

How the updater works:

1. On startup, the app checks the latest GitHub Release.
2. If the release tag is newer than `APP_VERSION`, the update modal appears.
3. The update flow only applies to the packaged `.exe` build.

To publish a new update:

1. Increase `APP_VERSION` in `version.py`.
2. Build the frontend and the `.exe`.
3. Create a GitHub Release with a matching tag, for example `v1.0.1`.
4. Upload the release package/zip expected by the updater.

Important:

- The updater is intended for the frozen Windows build.
- During development, update checks may still run, but the self-update install flow is not meant for local Python execution.

## Assets

- App icon: `logo-app.ico`
- Header logo image: `frontend/src/assets/imgs/logo.png`

## Troubleshooting

- If the app starts but no music appears, make sure the `downloads/` folder contains MP3 files.
- If downloads fail, verify FFmpeg is installed and `yt-dlp` can access the internet.
- If the UI looks stale in the `.exe`, rebuild `frontend/dist` before packaging again.

## License

Add your license here if needed.
