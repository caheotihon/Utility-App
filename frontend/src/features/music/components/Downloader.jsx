import { useState, useEffect, useRef } from 'react'
import { DownloadCloud, Download, RefreshCw, Loader2, CheckCircle2, AlertCircle, X, Music2 } from 'lucide-react'
import { useAudioDownload } from '../../../context/AudioContext'

export default function Downloader() {
  const [urls, setUrls] = useState('')
  const { downloadStatus, refreshPlaylist, setDownloadStatus } = useAudioDownload()
  const textareaRef = useRef(null)

  // Tự động tăng chiều cao textarea mượt mà
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [urls])

  const handleDownload = () => {
    const urlList = urls.split('\n').map(u => u.trim()).filter(u => u)
    if (urlList.length === 0) {
      setDownloadStatus('⚠️ Vui lòng nhập link YouTube!')
      return
    }

    setDownloadStatus('⏳ Đang kết nối server...')
    if (window.eel) {
      window.eel.start_download(urlList)
      setUrls('') // Xóa text sau khi bắt đầu để giao diện sạch sẽ
    } else {
      setDownloadStatus('❌ Không tìm thấy kết nối Eel')
    }
  }

  // Refactor logic style để clean hơn
  const getStatusConfig = () => {
    const s = downloadStatus.toLowerCase()
    if (s.includes('✅') || s.includes('hoàn tất') || s.includes('thành công')) {
      return {
        container: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400',
        icon: <CheckCircle2 className="w-4 h-4" />
      }
    }
    if (s.includes('❌') || s.includes('⚠️') || s.includes('lỗi')) {
      return {
        container: 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 text-rose-700 dark:text-rose-400',
        icon: <AlertCircle className="w-4 h-4" />
      }
    }
    return {
      container: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400',
      icon: <Loader2 className="w-4 h-4 animate-spin" />
    }
  }

  const status = getStatusConfig()

  return (
    <div className="music-panel-shell flex flex-col gap-4">
      <header className="flex items-center justify-between shrink-0">
        <h2 className="music-panel-title text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white uppercase tracking-wider">
          <DownloadCloud className="w-5 h-5 text-indigo-500" /> Tải nhạc mới
        </h2>
        <span className="music-panel-badge text-[10px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">YouTube MP3</span>
      </header>

      <div className="relative group">
  <textarea
    ref={textareaRef}
    value={urls}
    onChange={(e) => setUrls(e.target.value)}
    className="
      music-panel-textarea
      w-full p-4 rounded-2xl 
      bg-white dark:bg-[#10182880] 
      border border-black/[0.03] dark:border-white/10 
      placeholder-gray-400 dark:placeholder-gray-600 
      focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 
      transition-all text-sm shrink-0 shadow-sm 
      text-gray-900 dark:text-white
      
      /* Cấu hình scroll cũ nhưng thêm class mới */
      resize-none 
      min-h-[100px] 
      max-h-[250px] 
      overflow-y-auto 
      scrollbar-custom
      leading-relaxed
    "
    placeholder="Dán link YouTube tại đây (mỗi dòng 1 link)..."
  />
  <Music2 className="absolute right-4 bottom-4 w-5 h-5 text-gray-200 dark:text-gray-700 pointer-events-none group-focus-within:text-indigo-500/20 transition-colors" />
</div>

      <div className="music-panel-actions grid grid-cols-1 gap-3">
        <button
          onClick={handleDownload}
          className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <Download className="w-4 h-4" /> Tải ngay
        </button>

        <button
          onClick={() => { refreshPlaylist(); setDownloadStatus('✅ Đã cập nhật thư viện'); }}
          className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 text-gray-600 dark:text-gray-300 py-3 rounded-2xl transition-all text-sm font-bold flex items-center justify-center gap-2 cursor-pointer border border-black/[0.03] dark:border-white/5"
        >
          <RefreshCw className="w-4 h-4" /> Làm mới
        </button>
      </div>

      {downloadStatus && (
        <div className={`music-panel-status p-4 rounded-2xl flex items-start gap-3 border animate-in slide-in-from-bottom-2 duration-300 ${status.container}`}>
          <div className="mt-0.5">{status.icon}</div>
          <div className="flex-1 text-xs font-bold leading-relaxed">{downloadStatus}</div>
          <button onClick={() => setDownloadStatus('')} className="hover:scale-110 transition-transform">
            <X className="w-4 h-4 opacity-50 hover:opacity-100" />
          </button>
        </div>
      )}
    </div>
  )
}
