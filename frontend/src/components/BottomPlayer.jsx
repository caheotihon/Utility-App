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

export default function BottomPlayer({ activeTab, setActiveTab }) {
    const { theme } = useTheme()
    const {
        currentTrack, isPlaying, currentTime, duration,
        volume = 0.6, isMuted, isShuffle, repeatMode, isMiniPlayer
    } = useAudioPlayback()
    const {
        togglePlay, seek, setVolume, setIsMuted,
        toggleShuffle, toggleRepeat, handleNext, handlePrev,
        toggleFavorite, setIsMiniPlayer
    } = useAudioActions()

    const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false)

    const progressPercent = duration ? (currentTime / duration) * 100 : 0
    const activeColor = theme === 'dark' ? '#10b981' : '#059669' // emerald-500/600
    const inactiveColor = theme === 'dark' ? '#374151' : '#cbd5e1' // gray-700/300

    const handleSeek = useCallback((e) => {
        seek(Number(e.target.value))
    }, [seek])

    const handleToggleNowPlaying = () => {
        setActiveTab(prev => (prev === 'now_playing' ? 'home' : 'now_playing'))
    }

    if (isMiniPlayer) return null

    const currentVolume = isMuted ? 0 : volume
    const volumePercent = Math.round(currentVolume * 100)

    return (
        <div className="h-[75px] sm:h-[90px] w-full bg-white dark:bg-[#212121] border-t border-black/5 dark:border-white/5 flex flex-col relative z-50 shrink-0 select-none">
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
                    className="absolute h-2.5 w-2.5 bg-emerald-500 rounded-full shadow-md pointer-events-none hidden group-hover:block transition-transform origin-center"
                    style={{ left: `calc(${progressPercent}% - 5px)` }}
                />
            </div>

            <div className="flex-1 flex items-center justify-between px-2 sm:px-6 gap-2 sm:gap-4">
                {/* Left Controls */}
                <div className="flex items-center gap-1.5 sm:gap-4 min-w-[120px] sm:min-w-[180px]">
                    <div className="flex items-center gap-1 sm:gap-2">
                        <button 
                            title="Bài trước"
                            onClick={handlePrev} 
                            className="p-1 text-gray-900 dark:text-white hover:text-emerald-500 transition-colors"
                        >
                            <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                        </button>
                        <button 
                            title={isPlaying ? "Tạm dừng" : "Phát"}
                            onClick={togglePlay} 
                            className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors text-gray-900 dark:text-white"
                        >
                            {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5 sm:ml-1" />}
                        </button>
                        <button 
                            title="Bài tiếp theo"
                            onClick={handleNext} 
                            className="p-1 text-gray-900 dark:text-white hover:text-emerald-500 transition-colors"
                        >
                            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                        </button>
                    </div>
                    <div className="hidden md:flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 font-mono tracking-tighter">
                        <span>{formatTime(currentTime)}</span>
                        <span>/</span>
                        <span>{currentTrack?.duration || '0:00'}</span>
                    </div>
                </div>

                {/* Center: Track Info */}
                <div className="flex-1 flex items-center justify-center min-w-0 max-w-xs sm:max-w-xl mx-1 sm:mx-4">
                    {currentTrack ? (
                        <div className="flex items-center gap-2 sm:gap-4 w-full justify-start sm:justify-center">
                            {/* Avatar */}
                            <div 
                                title={activeTab === 'now_playing' ? "Đóng giao diện phát" : "Mở giao diện phát"}
                                className="w-10 h-10 sm:w-14 sm:h-14 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 cursor-pointer group/art relative"
                                onClick={handleToggleNowPlaying}
                            >
                                {currentTrack.cover ? (
                                    <img src={currentTrack.cover} alt="Cover" className="w-full h-full object-cover transition-transform group-hover/art:scale-105" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ListMusic className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/art:opacity-100 transition-opacity flex items-center justify-center">
                                    <Shrink className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            {/* Title & Artist */}
                            <div 
                                title={activeTab === 'now_playing' ? "Đóng giao diện phát" : "Mở giao diện phát"}
                                className="flex flex-col min-w-0 justify-center cursor-pointer" 
                                onClick={handleToggleNowPlaying}
                            >
                                <h4 className="text-[12px] sm:text-[14px] font-bold text-gray-900 dark:text-white truncate hover:underline leading-tight">
                                    {currentTrack.title}
                                </h4>
                                <span className="text-[11px] sm:text-[12px] text-gray-500 dark:text-gray-400 truncate hover:underline mt-0.5">
                                    {currentTrack.artist}
                                </span>
                            </div>

                            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                                <button 
                                    title="Yêu thích bài hát này"
                                    onClick={() => toggleFavorite(currentTrack.file)}
                                    className="p-1 sm:p-2 rounded-full text-gray-400 hover:text-rose-500 transition-colors"
                                >
                                    <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                                <button 
                                    title="Thêm vào danh sách phát cá nhân"
                                    onClick={() => setIsAddToPlaylistOpen(true)}
                                    className="p-1 sm:p-2 rounded-full text-gray-400 hover:text-emerald-500 transition-colors"
                                >
                                    <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <span className="text-xs sm:text-sm font-medium text-gray-400">Không có bài hát nào</span>
                    )}
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-1 sm:gap-2 justify-end min-w-fit sm:min-w-[180px]">
                    {/* Volume Control */}
                    <div className="relative group/volume pt-2 pb-2 px-1">
                        <button 
                            title={isMuted ? "Bật âm thanh" : "Tắt tiếng"}
                            onClick={() => setIsMuted(!isMuted)} 
                            className="text-gray-500 dark:text-gray-400 hover:text-emerald-500 transition-colors p-1 sm:p-1.5 rounded-full"
                        >
                            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                        
                        {/* Popup Panel chứa số phần trăm & slider */}
                        <div className="absolute bottom-11 left-1/2 -translate-x-1/2 flex-col items-center gap-1.5 bg-white dark:bg-[#282828] border border-black/5 dark:border-white/10 p-2 rounded-md shadow-lg hidden group-hover/volume:flex z-[60]">
                            {/* Số phần trăm nhỏ */}
                            <span className="text-[10px] font-bold font-mono text-gray-500 dark:text-gray-300">
                                {volumePercent}%
                            </span>
                            {/* Input dọc đã được nâng cao và làm nhỏ thumb */}
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={currentVolume}
                                onChange={(e) => {
                                    setVolume(parseFloat(e.target.value))
                                    if (isMuted) setIsMuted(false)
                                }}
                                className="h-20 w-1 rounded-lg appearance-none cursor-pointer accent-emerald-500 custom-volume-slider"
                                style={{
                                    WebkitAppearance: 'slider-vertical',
                                    background: `linear-gradient(to top, ${activeColor} ${currentVolume * 100}%, ${inactiveColor} ${currentVolume * 100}%)`,
                                }}
                            />
                        </div>
                    </div>

                    <button 
                        title="Chế độ lặp lại" 
                        onClick={toggleRepeat}
                        className={`p-1 sm:p-1.5 rounded-full transition-colors hidden sm:block ${repeatMode === 'one' ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400 hover:text-emerald-500'}`}
                    >
                        <Repeat1 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button 
                        title="Chế độ trộn bài" 
                        onClick={toggleShuffle}
                        className={`p-1 sm:p-1.5 rounded-full transition-colors hidden sm:block ${isShuffle ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400 hover:text-emerald-500'}`}
                    >
                        <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    
                    <div className="w-[1px] h-4 bg-gray-200 dark:bg-white/10 mx-0.5 hidden sm:block"></div>
                    
                    <button 
                        title={activeTab === 'now_playing' ? "Đóng danh sách phát" : "Mở danh sách phát"}
                        onClick={handleToggleNowPlaying}
                        className="p-1 sm:p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                        <ListMusic className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button 
                        title="Thu nhỏ xuống khay hệ thống" 
                        onClick={() => window.eel && window.eel.minimize_to_tray()}
                        className="p-1 sm:p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                        <Shrink className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>
            </div>

            <AddToPlaylistModal
                isOpen={isAddToPlaylistOpen}
                onClose={() => setIsAddToPlaylistOpen(false)}
                track={currentTrack}
            />

            {/* Thêm chút CSS cho việc thu nhỏ núm vặn (thumb) của input dọc */}
            <style>{`
                .custom-volume-slider::-webkit-slider-thumb {
                    width: 8px !important;
                    height: 8px !important;
                    border-radius: 50%;
                    background: #10b981;
                    cursor: pointer;
                    -webkit-appearance: none;
                }
                .custom-volume-slider::-moz-range-thumb {
                    width: 8px !important;
                    height: 8px !important;
                    border-radius: 50%;
                    background: #10b981;
                    cursor: pointer;
                    border: none;
                }
            `}</style>
        </div>
    )
}