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

  // Cấu hình style trạng thái trực quan, bo mịn màng hơn
  const getStatusConfig = () => {
    if (!downloadStatus) return { container: '', icon: null }
    const s = downloadStatus.toLowerCase()
    
    if (s.includes('✅') || s.includes('hoàn tất') || s.includes('thành công')) {
      return {
        container: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
      }
    }
    if (s.includes('❌') || s.includes('⚠️') || s.includes('lỗi')) {
      return {
        container: 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400',
        icon: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
      }
    }
    return {
      container: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400',
      icon: <Loader2 className="w-4 h-4 animate-spin text-indigo-500 shrink-0" />
    }
  }

  const status = getStatusConfig()

  return (
    <div className="w-full flex flex-col gap-5 p-1 select-none animate-in fade-in-50 duration-300">
      {/* Header Panel */}
      <header className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3 shrink-0">
        <h2 className="text-sm lg:text-xl font-black flex items-center gap-2 text-gray-900 dark:text-white uppercase tracking-wider">
          <DownloadCloud className="w-5 h-5 text-indigo-500" /> Tải nhạc mới
        </h2>
        <span className="text-[10px] sm:text-xs bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg font-bold tracking-tight">
          YouTube MP3
        </span>
      </header>

      {/* Vùng Textarea nhập liệu */}
      <div className="relative group w-full">
        <textarea
          ref={textareaRef}
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          className="
            w-full p-4 pr-12 rounded-2xl 
            bg-gray-50/50 dark:bg-[#161b26] 
            border border-black/5 dark:border-white/10 
            placeholder-gray-400 dark:placeholder-gray-500 
            focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 focus:bg-white dark:focus:bg-[#111622]
            transition-all text-sm shrink-0 shadow-inner
            text-gray-900 dark:text-white
            resize-none 
            min-h-[110px] 
            max-h-[220px] 
            overflow-y-auto 
            scrollbar-none
            leading-relaxed
          "
          placeholder="Dán một hoặc nhiều link video YouTube tại đây (Mỗi dòng một link)..."
        />
        <Music2 className="absolute right-4 bottom-4 w-5 h-5 text-gray-300 dark:text-gray-600 pointer-events-none group-focus-within:text-indigo-500/30 group-focus-within:scale-110 transition-all duration-300" />
      </div>

      {/* Khu vực nút bấm: Đã chuyển sang hàng ngang cho gọn đẹp */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <button
          title="Bắt đầu tải danh sách liên kết từ YouTube về máy"
          onClick={handleDownload}
          className="w-full sm:flex-[2] bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10 dark:shadow-none text-sm tracking-wide"
        >
          <Download className="w-4 h-4" /> Tải ngay
        </button>

        <button
          title="Quét lại thư mục nhạc để cập nhật bài hát mới tải vào danh sách"
          onClick={() => { refreshPlaylist(); setDownloadStatus('✅ Đã cập nhật thư viện thành công!'); }}
          className="w-full sm:flex-1 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 active:scale-[0.98] text-gray-600 dark:text-gray-300 py-3.5 px-4 rounded-2xl transition-all text-sm font-bold flex items-center justify-center gap-2 cursor-pointer border border-black/5 dark:border-white/5 shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> Làm mới
        </button>
      </div>

      {/* Hộp thông báo trạng thái tải tiến trình */}
      {downloadStatus && (
        <div className={`p-4 rounded-2xl flex items-start gap-3 border backdrop-blur-md animate-in slide-in-from-bottom-3 duration-300 ${status.container}`}>
          <div className="mt-0.5">{status.icon}</div>
          <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed font-mono">{downloadStatus}</div>
          <button 
            title="Đóng thông báo"
            onClick={() => setDownloadStatus('')} 
            className="hover:scale-110 active:scale-95 transition-transform p-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-current"
          >
            <X className="w-4 h-4 opacity-60 hover:opacity-100 transition-opacity" />
          </button>
        </div>
      )}
    </div>
  )
}