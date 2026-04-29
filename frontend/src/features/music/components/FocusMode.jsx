import { useState, useEffect, useCallback } from 'react'
import { useAudioActions, useAudioPlayback } from '../../../context/AudioContext'
import { Timer, Coffee, Play, Pause, RotateCcw, Brain } from 'lucide-react'

export default function FocusMode() {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState('focus') // focus, break
  
  const { togglePlay } = useAudioActions()
  const { isPlaying } = useAudioPlayback()

  useEffect(() => {
    let interval = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
      // Auto toggle mode or notify
      if (mode === 'focus') {
        alert('Hết giờ tập trung! Hãy nghỉ ngơi một chút.')
        setMode('break')
        setTimeLeft(5 * 60)
      } else {
        alert('Nghỉ ngơi kết thúc! Sẵn sàng tập trung chưa?')
        setMode('focus')
        setTimeLeft(25 * 60)
      }
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft, mode])

  const toggleTimer = () => {
    setIsActive(!isActive)
    if (!isActive && !isPlaying) {
      togglePlay() // Auto play music when starting focus
    }
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60)
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

      <div className="relative flex items-center justify-center">
        {/* Progress Circle (Simplified) */}
        <div className="w-48 h-48 rounded-full border-4 border-gray-100 dark:border-white/5 flex flex-col items-center justify-center shadow-inner">
           <span className="text-4xl font-black text-gray-900 dark:text-white tabular-nums">
             {formatTime(timeLeft)}
           </span>
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mt-2">
             {mode === 'focus' ? 'Tập trung' : 'Nghỉ ngơi'}
           </span>
        </div>
        
        {/* Pulsing effect when active */}
        {isActive && (
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
        )}
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={resetTimer}
          className="p-3 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        
        <button 
          onClick={toggleTimer}
          className={`p-5 rounded-3xl transition-all shadow-xl ${
            isActive 
              ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' 
              : 'bg-indigo-600 text-white dark:bg-white dark:text-indigo-600'
          }`}
        >
          {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
        </button>

        <button 
          onClick={() => {
            const newMode = mode === 'focus' ? 'break' : 'focus'
            setMode(newMode)
            setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60)
            setIsActive(false)
          }}
          className="p-3 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all"
        >
          {mode === 'focus' ? <Coffee className="w-5 h-5" /> : <Timer className="w-5 h-5" />}
        </button>
      </div>

      <p className="text-[10px] font-bold text-gray-400 text-center max-w-[200px]">
        {isActive 
          ? "Đang trong chế độ tập trung. Nhạc sẽ tự động phát để giúp bạn làm việc hiệu quả hơn."
          : "Bắt đầu bộ đếm thời gian Pomodoro và chìm đắm vào không gian âm nhạc."
        }
      </p>
    </div>
  )
}
