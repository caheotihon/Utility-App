import { useAudio } from '../../../context/AudioContext'
import { Shuffle, SkipBack, Play, Pause, SkipForward, Repeat1, Volume2, VolumeX, ListMusic } from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'

export default function Player() {
  const { theme } = useTheme()
  const {
    currentTrack, isPlaying, togglePlay, currentTime, duration, seek,
    volume, setVolume, isMuted, setIsMuted,
    isShuffle, toggleShuffle,
    repeatMode, toggleRepeat,
    handleNext, handlePrev,
  } = useAudio()

  const formatTime = (sec) => {
    if (isNaN(sec) || !isFinite(sec)) return '0:00'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const handleSeek = (e) => {
    seek(Number(e.target.value))
  }

  const progressPercent = duration ? (currentTime / duration) * 100 : 0
  const volumePercent = isMuted ? 0 : volume * 100
  const activeColor = theme === 'dark' ? '#10b981' : '#059669'
  const inactiveColor = theme === 'dark' ? '#374151' : '#cbd5e1'

  return (
    <main className="music-player-shell w-full flex-1 md:h-full rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-2xl relative overflow-hidden bg-white dark:bg-gray-900 flex flex-col transition-all duration-500">
      <div
        className="absolute inset-0 bg-cover bg-center blur-[100px] scale-[1.5] pointer-events-none transition-all duration-1000 opacity-30 dark:opacity-60"
        style={{ backgroundImage: currentTrack?.cover ? `url('${currentTrack.cover}')` : 'none' }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/95 to-white dark:from-transparent dark:via-gray-900/80 dark:to-gray-900 pointer-events-none z-0" />

      <div className="relative z-10 flex-1 w-full overflow-y-auto md:overflow-y-hidden p-4 sm:p-5 lg:p-8 [@media(max-height:600px)]:p-2 flex flex-col no-scrollbar justify-center">
        <div className="w-full max-w-2xl m-auto flex flex-col items-center shrink-0">
          <div
            className={[
              'music-player-cover',
              'relative aspect-square rounded-full overflow-hidden',
              'bg-gray-200 dark:bg-gray-800',
              'shadow-[0_20px_40px_rgba(0,0,0,0.2)] dark:shadow-2xl',
              'flex items-center justify-center mb-[clamp(0.5rem,4vh,2rem)] shrink-0',
              'ring-4 ring-white dark:ring-gray-800',
              'will-change-transform animate-spin-slow',
              !isPlaying ? 'pause-animation' : '',
            ].join(' ')}
          >
            <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0)_40%,rgba(0,0,0,0.3)_100%)]" />
            <div className="absolute inset-0 z-10 opacity-20 bg-[repeating-radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0px,rgba(255,255,255,0.1)_1px,transparent_1px,transparent_10px)] mix-blend-overlay" />

            <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center">
              {currentTrack?.cover ? (
                <img
                  src={currentTrack.cover}
                  alt="cover"
                  className="w-full h-full object-cover transition-transform duration-1000"
                />
              ) : (
                <ListMusic className="w-1/3 h-1/3 text-gray-400 dark:text-gray-600" />
              )}
            </div>

            <div className="absolute z-20 top-1/2 left-1/2 w-[8%] h-[8%] min-w-[12px] min-h-[12px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white dark:bg-gray-900 shadow-inner ring-4 ring-black/10" />
          </div>

          <div className="text-center mb-8 [@media(max-height:700px)]:mb-4 [@media(max-height:600px)]:mb-2 w-full px-2">
            <h1 className="music-player-title text-base font-black text-gray-900 dark:text-white tracking-tight truncate transition-all">
              {currentTrack?.title || 'Chưa chọn bài'}
            </h1>
            <p className="music-player-artist text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-2 [@media(max-height:600px)]:mt-1 transition-all">
              {currentTrack?.artist || 'Nghệ sĩ'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-8 [@media(max-height:700px)]:mb-4 [@media(max-height:600px)]:mb-2 w-full">
            <button
              title="Trộn bài"
              onClick={toggleShuffle}
              className={`cursor-pointer w-10 h-10 sm:w-12 sm:h-12 [@media(max-height:600px)]:w-8 [@media(max-height:600px)]:h-8 flex items-center justify-center rounded-full transition-all duration-300 ${
                isShuffle
                  ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button onClick={handlePrev} className="cursor-pointer w-10 h-10 sm:w-12 sm:h-12 [@media(max-height:600px)]:w-8 [@media(max-height:600px)]:h-8 flex items-center justify-center rounded-full text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95">
              <SkipBack className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="cursor-pointer w-12 h-12 sm:w-14 sm:h-14 [@media(max-height:600px)]:w-10 [@media(max-height:600px)]:h-10 flex items-center justify-center rounded-full bg-indigo-600 dark:bg-white text-white dark:text-gray-900 shadow-xl shadow-indigo-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />}
            </button>

            <button onClick={handleNext} className="cursor-pointer w-10 h-10 sm:w-12 sm:h-12 [@media(max-height:600px)]:w-8 [@media(max-height:600px)]:h-8 flex items-center justify-center rounded-full text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95">
              <SkipForward className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </button>

            <button
              title={repeatMode === 'one' ? 'Tắt lặp lại' : 'Lặp lại 1 bài'}
              onClick={toggleRepeat}
              className={`cursor-pointer w-10 h-10 sm:w-12 sm:h-12 [@media(max-height:600px)]:w-8 [@media(max-height:600px)]:h-8 flex items-center justify-center rounded-full transition-all duration-300 ${
                repeatMode === 'one'
                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Repeat1 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="w-full bg-gray-100/50 dark:bg-black/20 px-3 py-2 sm:px-4 [@media(max-height:600px)]:py-1.5 rounded-3xl border border-black/[0.03] dark:border-white/5">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-[10px] sm:text-xs font-black text-gray-600 dark:text-gray-400 min-w-[36px] sm:min-w-[40px] tabular-nums">
                {formatTime(currentTime)}
              </span>

              <div className="flex-1 relative flex items-center">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime || 0}
                  onChange={handleSeek}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  style={{ background: `linear-gradient(to right, ${activeColor} ${progressPercent}%, ${inactiveColor} ${progressPercent}%)` }}
                />
              </div>

              <span className="text-[10px] sm:text-xs font-black text-gray-600 dark:text-gray-400 min-w-[36px] sm:min-w-[40px] text-right tabular-nums">
                {currentTrack?.duration || '0:00'}
              </span>

              <div className="relative group/volume flex items-center justify-center ml-1 sm:ml-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
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
