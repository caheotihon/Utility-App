import { useCallback, useState } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat1, Shuffle, Heart, PlusCircle, Shrink, ListMusic } from 'lucide-react'
import { useAudioPlayback, useAudioActions } from '../context/AudioContext'
import { useTheme } from '../context/ThemeContext'
import AddToPlaylistModal from '../features/music/components/AddToPlaylistModal'

const formatTime = (sec) => {
    if (isNaN(sec) || !isFinite(sec)) return '0:00'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
}

export default function BottomPlayer({ setActiveTab }) {
    const { theme } = useTheme()
    const {
        currentTrack, isPlaying, currentTime, duration,
        volume, isMuted, isShuffle, repeatMode, isMiniPlayer
    } = useAudioPlayback()
    const {
        togglePlay, seek, setVolume, setIsMuted,
        toggleShuffle, toggleRepeat, handleNext, handlePrev,
        toggleFavorite, setIsMiniPlayer
    } = useAudioActions()

    const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false)

    const progressPercent = duration ? (currentTime / duration) * 100 : 0
    const volumePercent = isMuted ? 0 : volume * 100
    const activeColor = theme === 'dark' ? '#10b981' : '#059669' // emerald-500/600
    const inactiveColor = theme === 'dark' ? '#374151' : '#cbd5e1' // gray-700/300

    const handleSeek = useCallback((e) => {
        seek(Number(e.target.value))
    }, [seek])

    const isFav = currentTrack && false // TODO: fix favorites using favorites from context
    // Actually, favorites are in library. Let's just use it properly if we can get it, or leave it for later.

    if (isMiniPlayer) return null

    return (
        <div className="h-[90px] w-full bg-white dark:bg-[#212121] border-t border-black/5 dark:border-white/5 flex flex-col relative z-50 shrink-0">
            {/* Top Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 -translate-y-1/2 group cursor-pointer flex items-center">
                <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.1"
                    value={currentTime || 0}
                    onChange={handleSeek}
                    className="absolute w-full h-3 opacity-0 cursor-pointer z-10"
                />
                <div 
                    className="h-1 bg-emerald-500 pointer-events-none transition-all"
                    style={{ width: `${progressPercent}%` }}
                />
                <div 
                    className="absolute h-3 w-3 bg-emerald-500 rounded-full shadow-md pointer-events-none scale-0 group-hover:scale-100 transition-transform origin-center"
                    style={{ left: `calc(${progressPercent}% - 6px)` }}
                />
            </div>

            <div className="flex-1 flex items-center justify-between px-4 sm:px-6">
                {/* Left Controls */}
                <div className="flex items-center gap-4 sm:gap-6 min-w-[200px]">
                    <div className="flex items-center gap-3">
                        <button onClick={handlePrev} className="text-gray-900 dark:text-white hover:text-emerald-500 transition-colors">
                            <SkipBack className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                        </button>
                        <button onClick={togglePlay} className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors text-gray-900 dark:text-white">
                            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                        </button>
                        <button onClick={handleNext} className="text-gray-900 dark:text-white hover:text-emerald-500 transition-colors">
                            <SkipForward className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                        </button>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 font-mono tracking-tighter">
                        <span>{formatTime(currentTime)}</span>
                        <span>/</span>
                        <span>{currentTrack?.duration || '0:00'}</span>
                    </div>
                </div>

                {/* Center: Track Info */}
                <div className="flex-1 flex items-center justify-center max-w-xl mx-4">
                    {currentTrack ? (
                        <div className="flex items-center gap-4 w-full max-w-md">
                            <div 
                                className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 cursor-pointer group/art relative"
                                onClick={() => setActiveTab('now_playing')}
                            >
                                {currentTrack.cover ? (
                                    <img src={currentTrack.cover} alt="Cover" className="w-full h-full object-cover transition-transform group-hover/art:scale-105" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ListMusic className="w-6 h-6 text-gray-400" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/art:opacity-100 transition-opacity flex items-center justify-center">
                                    <Shrink className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="flex flex-col min-w-0 flex-1 justify-center cursor-pointer" onClick={() => setActiveTab('now_playing')}>
                                <h4 className="text-[14px] font-bold text-gray-900 dark:text-white truncate hover:underline">
                                    {currentTrack.title}
                                </h4>
                                <span className="text-[12px] text-gray-500 dark:text-gray-400 truncate hover:underline">
                                    {currentTrack.artist}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => toggleFavorite(currentTrack.file)}
                                    className="p-2 rounded-full text-gray-400 hover:text-rose-500 transition-colors"
                                >
                                    {/* We will handle real active state later */}
                                    <Heart className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => setIsAddToPlaylistOpen(true)}
                                    className="p-2 rounded-full text-gray-400 hover:text-emerald-500 transition-colors"
                                >
                                    <PlusCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <span className="text-sm font-medium text-gray-400">Không có bài hát nào</span>
                    )}
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-3 sm:gap-4 justify-end min-w-[200px]">
                    <div className="hidden lg:flex items-center gap-2 group/volume w-32 relative">
                        <button onClick={() => setIsMuted(!isMuted)} className="text-gray-500 dark:text-gray-400 hover:text-emerald-500 transition-colors p-1">
                            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
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
                            className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            style={{
                                background: `linear-gradient(to right, ${activeColor} ${(isMuted ? 0 : volume) * 100}%, ${inactiveColor} ${(isMuted ? 0 : volume) * 100}%)`,
                            }}
                        />
                    </div>

                    <button 
                        title="Lặp lại" 
                        onClick={toggleRepeat}
                        className={`p-2 rounded-full transition-colors ${repeatMode === 'one' ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400 hover:text-emerald-500'}`}
                    >
                        <Repeat1 className="w-5 h-5" />
                    </button>
                    <button 
                        title="Trộn bài" 
                        onClick={toggleShuffle}
                        className={`p-2 rounded-full transition-colors ${isShuffle ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400 hover:text-emerald-500'}`}
                    >
                        <Shuffle className="w-5 h-5" />
                    </button>
                    <div className="w-[1px] h-6 bg-gray-200 dark:bg-white/10 mx-1"></div>
                    <button 
                        title="Tiếp theo" 
                        onClick={() => setActiveTab('now_playing')}
                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                        <ListMusic className="w-5 h-5" />
                    </button>
                    <button 
                        title="Thu nhỏ xuống khay hệ thống" 
                        onClick={() => window.eel && window.eel.minimize_to_tray()}
                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                        <Shrink className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <AddToPlaylistModal
                isOpen={isAddToPlaylistOpen}
                onClose={() => setIsAddToPlaylistOpen(false)}
                track={currentTrack}
            />
        </div>
    )
}
