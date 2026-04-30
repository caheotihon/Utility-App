import { useState, useEffect, useRef } from 'react'
import { useAudioActions, useAudioPlayback } from '../../../context/AudioContext'
import { Timer, Coffee, Play, Pause, RotateCcw, Brain, Edit2 } from 'lucide-react'

export default function FocusMode() {
  const [mode, setMode] = useState(() => localStorage.getItem('focus_mode') || 'focus')
  const [isActive, setIsActive] = useState(() => localStorage.getItem('focus_isActive') === 'true')
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem('focus_timeLeft')
    if (saved) return parseInt(saved)
    return localStorage.getItem('focus_mode') === 'break' ? 5 * 60 : 25 * 60
  })

  // State hỗ trợ nhập thời gian thủ công
  const [isEditing, setIsEditing] = useState(false)
  const [inputMinutes, setInputMinutes] = useState("")

  const { togglePlay } = useAudioActions()
  const { isPlaying } = useAudioPlayback()
  const intervalRef = useRef(null)

  // Dùng ref để giữ giá trị mode mới nhất trong setInterval (tránh lỗi Stale Closure của React)
  const modeRef = useRef(mode)
  useEffect(() => { modeRef.current = mode }, [mode])

  // Sync state cơ bản xuống localStorage
  useEffect(() => {
    localStorage.setItem('focus_mode', mode)
    localStorage.setItem('focus_isActive', isActive)
    localStorage.setItem('focus_timeLeft', timeLeft)
  }, [mode, isActive, timeLeft])

  // Hàm xử lý khi hết giờ (Đưa ra ngoài để gọi từ nhiều nơi)
  const handleTimerComplete = () => {
    setIsActive(false)
    clearInterval(intervalRef.current)
    localStorage.removeItem('focus_endTime')

    if (modeRef.current === 'focus') {
      alert('Hết giờ tập trung! Hãy nghỉ ngơi một chút.')
      switchMode('break')
    } else {
      alert('Nghỉ ngơi kết thúc! Sẵn sàng tập trung chưa?')
      switchMode('focus')
    }
  }

  // Chạy khi khởi động: Kiểm tra xem có đang chạy dở ở tab/trạng thái trước không
  useEffect(() => {
    const savedEndTime = localStorage.getItem('focus_endTime')
    const savedIsActive = localStorage.getItem('focus_isActive') === 'true'

    if (savedIsActive && savedEndTime) {
      const endTime = parseInt(savedEndTime, 10)
      const now = Date.now()
      const remaining = Math.max(0, Math.round((endTime - now) / 1000))

      if (remaining > 0) {
        setTimeLeft(remaining)
      } else {
        setTimeLeft(0)
        handleTimerComplete()
      }
    }
  }, []) // Chỉ chạy 1 lần khi render

  // Timer logic - Chống được cả Reload lẫn Switch Tab
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      let expectedEnd = parseInt(localStorage.getItem('focus_endTime'), 10)

      // Nếu chưa có expectedEnd, tạo mới
      if (!expectedEnd || isNaN(expectedEnd)) {
        expectedEnd = Date.now() + timeLeft * 1000
        localStorage.setItem('focus_endTime', expectedEnd.toString())
      }

      intervalRef.current = setInterval(() => {
        const now = Date.now()
        const remaining = Math.max(0, Math.round((expectedEnd - now) / 1000))
        setTimeLeft(remaining)

        if (remaining <= 0) {
          handleTimerComplete()
        }
      }, 500)

    } else if (!isActive) {
      clearInterval(intervalRef.current)
      localStorage.removeItem('focus_endTime')
    }

    return () => clearInterval(intervalRef.current)
    // Bỏ timeLeft khỏi dependency để không bị cấp phát lại expectedEnd khi re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  const switchMode = (newMode) => {
    setMode(newMode)
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60)
    setIsActive(false)
    localStorage.removeItem('focus_endTime')
  }

  const toggleTimer = () => {
    if (isEditing) return // Ngăn bật khi đang gõ chữ
    const nextActive = !isActive
    setIsActive(nextActive)
    if (nextActive && !isPlaying) {
      togglePlay()
    }
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60)
    localStorage.removeItem('focus_endTime')
  }

  // --- LOGIC NHẬP THỜI GIAN ---
  const handleTimeClick = () => {
    if (!isActive) {
      setInputMinutes(Math.floor(timeLeft / 60).toString())
      setIsEditing(true)
    }
  }

  const handleSaveTime = () => {
    setIsEditing(false)
    const mins = parseInt(inputMinutes, 10)
    if (!isNaN(mins) && mins > 0) {
      setTimeLeft(mins * 60)
    }
  }

  const formatTime = (s) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="w-5 h-5 text-purple-500" />
        <h3 className="text-sm font-black uppercase tracking-wider text-gray-400">Focus Mode</h3>
      </div>

      <div className="relative flex items-center justify-center group">
        <div className="w-48 h-48 rounded-full border-4 border-gray-100 dark:border-white/5 flex flex-col items-center justify-center shadow-inner bg-white/50 dark:bg-black/5 backdrop-blur-sm transition-colors">

          {/* Nhập/Hiển thị số liệu */}
          {isEditing ? (
            <input
              type="number"
              autoFocus
              value={inputMinutes}
              onChange={(e) => setInputMinutes(e.target.value)}
              onBlur={handleSaveTime}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTime()}
              className="w-24 bg-transparent text-center text-4xl font-black text-indigo-500 tabular-nums outline-none border-b-2 border-indigo-500"
              min="1"
              max="120"
            />
          ) : (
            <span
              onClick={handleTimeClick}
              className={`text-4xl font-black tabular-nums transition-colors flex items-center gap-2 ${!isActive
                ? 'cursor-pointer hover:text-indigo-500 text-gray-900 dark:text-white'
                : 'text-gray-900 dark:text-white pointer-events-none'
                }`}
              title={!isActive ? "Nhấn để sửa thời gian" : ""}
            >
              {formatTime(timeLeft)}
            </span>
          )}

          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mt-2">
            {mode === 'focus' ? 'Tập trung' : 'Nghỉ ngơi'}
          </span>
        </div>

        {isActive && (
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={resetTimer}
          className="p-3 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all hover:scale-110 active:scale-95"
          title="Reset"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={toggleTimer}
          className={`cursor-pointer p-5 rounded-3xl transition-all shadow-xl hover:scale-105 active:scale-95 ${isActive
            ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
            : 'bg-indigo-600 text-white dark:bg-white dark:text-indigo-600'
            }`}
        >
          {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
        </button>

        <button
          onClick={() => switchMode(mode === 'focus' ? 'break' : 'focus')}
          className="p-3 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all hover:scale-110 active:scale-95"
          title={mode === 'focus' ? 'Chuyển sang nghỉ ngơi' : 'Chuyển sang tập trung'}
        >
          {mode === 'focus' ? <Coffee className="w-5 h-5" /> : <Timer className="w-5 h-5" />}
        </button>
      </div>

      <p className="text-[10px] font-bold text-gray-400 text-center max-w-[200px] leading-relaxed">
        {isActive
          ? "Đang trong chế độ tập trung. Nhạc sẽ tự động phát để giúp bạn chill hơn."
          : "Bắt đầu bộ đếm thời gian hoặc nhấn vào đồng hồ để sửa số phút mong muốn."
        }
      </p>
    </div>
  )
}