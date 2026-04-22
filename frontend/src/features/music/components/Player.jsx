import { useAudio } from '../../../context/AudioContext'
import { Shuffle, SkipBack, Play, Pause, SkipForward, Repeat1, Volume2, VolumeX, ListMusic } from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'

export default function Player() {
  const { theme } = useTheme()
  const {
    currentTrack, isPlaying, togglePlay, currentTime, duration, seek,
    volume, setVolume, isMuted, setIsMuted, playMode, setPlayMode, toggleShuffle, handleNext, handlePrev,
    favorites, toggleFavorite
  } = useAudio()

  const formatTime = (sec) => {
    if (isNaN(sec) || !isFinite(sec)) return "0:00"
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const handleSeek = (e) => {
    seek(Number(e.target.value))
  }

  const progressPercent = duration ? (currentTime / duration) * 100 : 0
  const volumePercent = isMuted ? 0 : volume * 100

  const activeColor = theme === 'dark' ? '#10b981' : '#10b981'
  const inactiveColor = theme === 'dark' ? '#374151' : '#f1f5f9'

  return (
    <main className="w-full flex-1 md:h-full rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-2xl relative overflow-hidden bg-white dark:bg-gray-900 flex flex-col transition-all duration-500">
      {/* Ambient background */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-[100px] scale-[1.5] pointer-events-none transition-all duration-1000 opacity-30 dark:opacity-60"
        style={{ backgroundImage: currentTrack?.cover ? `url('${currentTrack.cover}')` : 'none' }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/95 to-white dark:from-transparent dark:via-gray-900/80 dark:to-gray-900 pointer-events-none z-0"></div>

      <div className="relative z-10 flex-1 w-full overflow-y-auto md:overflow-y-hidden p-4 sm:p-5 lg:p-8 flex flex-col no-scrollbar">
        <div className="w-full max-w-2xl m-auto flex flex-col items-center shrink-0">

          {/* Ảnh Cover */}
          <div className="w-52 h-52 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-3xl bg-gray-200 dark:bg-gray-800 shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:shadow-2xl flex items-center justify-center mb-6 lg:mb-8 overflow-hidden ring-1 ring-black/5 dark:ring-white/10 shrink-0">
            {currentTrack?.cover ? (
              <img src={currentTrack.cover} alt="cover" className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-110' : 'scale-100'}`} />
            ) : (
              <ListMusic className="w-20 h-20 text-gray-400 dark:text-gray-600" />
            )}
          </div>

          {/* Info */}
          <div className="text-center mb-8 w-full px-2">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight truncate">
              {currentTrack?.title || 'Chưa chọn bài'}
            </h1>
            <p className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-2">
              {currentTrack?.artist || 'Nghệ sĩ'}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-8 w-full">
            <button
              onClick={toggleShuffle}
              className={`cursor-pointer w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${playMode === 'shuffle'
                ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button onClick={handlePrev} className="cursor-pointer w-12 h-12 flex items-center justify-center rounded-full text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95">
              <SkipBack className="w-6 h-6 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="cursor-pointer w-14 h-14 flex items-center justify-center rounded-full bg-indigo-600 dark:bg-white text-white dark:text-gray-900 shadow-xl shadow-indigo-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </button>

            <button onClick={handleNext} className="cursor-pointer w-12 h-12 flex items-center justify-center rounded-full text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95">
              <SkipForward className="w-6 h-6 fill-current" />
            </button>

            <button
              onClick={() => setPlayMode(playMode === 'repeat' ? 'normal' : 'repeat')}
              className={`cursor-pointer w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${playMode === 'repeat'
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <Repeat1 className="w-5 h-5" />
            </button>
          </div>

          {/* Progress & Volume Control */}
          <div className="w-full bg-gray-100/50 dark:bg-black/20 px-4 py-2 rounded-3xl border border-black/[0.03] dark:border-white/5">
            <div className="flex items-center gap-4">
              <span className="text-xs font-black text-gray-600 dark:text-gray-400 min-w-[40px] tabular-nums">
                {formatTime(currentTime)}
              </span>

              <div className="flex-1 relative flex items-center">
                <input
                  type="range" min="0" max={duration || 100} step="0.1"
                  value={currentTime || 0}
                  onChange={handleSeek}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  style={{ background: `linear-gradient(to right, ${activeColor} ${progressPercent}%, ${inactiveColor} ${progressPercent}%)` }}
                />
              </div>

              <span className="text-xs font-black text-gray-600 dark:text-gray-400 min-w-[40px] text-right tabular-nums">
                {currentTrack?.duration || "0:00"}
              </span>

              {/* Volume Popover */}
              <div className="relative group/volume flex items-center justify-center ml-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>

                <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-6 opacity-0 invisible group-hover/volume:opacity-100 group-hover/volume:visible transition-all duration-300 ease-out z-50">
                  <div className="rounded-2xl flex flex-col items-center gap-2 min-w-[50px] transform origin-bottom transition-transform duration-300 group-hover/volume:scale-100 scale-95">
                    <div className="h-32 w-6 flex items-center justify-center relative">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => {
                          setVolume(parseFloat(e.target.value))
                          if (isMuted) setIsMuted(false)
                        }}
                        className="absolute w-32 h-1.5 rounded-lg appearance-none cursor-pointer accent-emerald-500 -rotate-90 origin-center"
                        style={{
                          background: `linear-gradient(to right, ${activeColor} ${volumePercent}%, ${inactiveColor} ${volumePercent}%)`,
                        }}
                      />
                    </div>
                    <div className="w-full text-center border-t border-gray-100 dark:border-white/10">
                      <span className="text-[10px] font-black text-gray-900 dark:text-white tabular-nums font-mono">
                        {Math.round(volumePercent)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}