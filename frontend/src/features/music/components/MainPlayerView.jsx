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
                <p className="text-xs sm:text-base">Chưa có bài hát nào đang phát.</p>
            </div>
        )
    }

    // Tạm thời để false hoặc kết nối với logic yêu thích thực tế của bạn
    const isFav = false

    return (
        <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-2 sm:p-6 select-none bg-transparent relative z-10">
            {/* VÙNG CHỨA ĐĨA NHẠC:
               - Đã sửa lỗi chính tả từ sm:max-w-[38px] THÀNH sm:max-w-[340px] để tránh bóp nghẹt đĩa nhạc.
               - Thay đổi từ overflow-hidden THÀNH overflow-visible để sóng nhạc thoải mái bung ra ngoài mà không bao giờ bị xén góc.
            */}
            <div className="w-full max-w-[190px] xs:max-w-[230px] sm:max-w-[340px] md:max-w-[420px] lg:max-w-[460px] aspect-square flex items-center justify-center relative mx-auto overflow-visible z-20">
                <MusicVisualizer
                    className="w-full h-full"
                    cover={currentTrack.cover}
                    isPlaying={isPlaying}
                    bassLevel={bassLevel}
                    frequencies={frequencies}
                    theme={theme}
                />
            </div>
        </div>
    )
}