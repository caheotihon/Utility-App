import { useTheme } from '../../../context/ThemeContext'
import { useAudioPlayback, useAudioActions } from '../../../context/AudioContext'
import MusicVisualizer from './MusicVisualizer'
import { Heart, MoreVertical } from 'lucide-react'

export default function MainPlayerView() {
    const { theme } = useTheme()
    const { currentTrack, isPlaying, bassLevel, frequencies } = useAudioPlayback()
    const { toggleFavorite } = useAudioActions()

    if (!currentTrack) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-4">
                <p className="text-sm sm:text-base">Chưa có bài hát nào đang phát.</p>
            </div>
        )
    }

    // Tạm thời để false hoặc kết nối với logic yêu thích thực tế của bạn
    const isFav = false

    return (
        <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-hidden bg-transparent">
            {/* Vùng chứa đĩa nhạc co giãn */}
            <div className="w-full max-w-[240px] xs:max-w-[280px] sm:max-w-[38px] md:max-w-[440px] aspect-square flex items-center justify-center relative mx-auto">
                <MusicVisualizer
                    className="w-full h-full"
                    cover={currentTrack.cover}
                    isPlaying={isPlaying}
                    bassLevel={bassLevel}
                    frequencies={frequencies}
                    theme={theme}
                />
            </div>
            
            {/* Khu vực thông tin bài hát toàn diện */}
            <div className="w-full max-w-sm sm:max-w-xl mt-8 sm:mt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 gap-4">
                
                {/* Khối chữ: Tràn ngang hoàn toàn trên di động không lo bị ép layout */}
                <div className="flex flex-col min-w-0 text-left sm:flex-1">
                    <h1 
                        title={currentTrack.title}
                        className="text-xl xs:text-2xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white truncate tracking-tight leading-tight"
                    >
                        {currentTrack.title}
                    </h1>
                    <p 
                        title={currentTrack.artist}
                        className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mt-1 sm:mt-2 truncate"
                    >
                        {currentTrack.artist}
                    </p>
                </div>
                
                {/* Khối nút: Tự động căn phải trên PC, trải đều hoặc giữ cụm cố định trên mobile */}
                <div className="flex items-center justify-start sm:justify-end gap-3 sm:gap-2 shrink-0 border-t border-white/5 pt-3 sm:pt-0 sm:border-none">
                    <button 
                        title="Yêu thích bài hát này"
                        onClick={() => toggleFavorite(currentTrack.file)}
                        className={`p-2.5 sm:p-3 rounded-full transition-colors ${isFav ? 'text-rose-500' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-rose-500'}`}
                    >
                        <Heart className={`w-6 h-6 sm:w-6 sm:h-6 md:w-7 md:h-7 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                    <button 
                        title="Tùy chọn khác"
                        className="p-2.5 sm:p-3 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                        <MoreVertical className="w-6 h-6 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                    </button>
                </div>

            </div>
        </div>
    )
}