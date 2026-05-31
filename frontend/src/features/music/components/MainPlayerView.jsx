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
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                <p>Chưa có bài hát nào đang phát.</p>
            </div>
        )
    }

    // TODO: Connect real favorite state
    const isFav = false

    return (
        <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl aspect-square max-h-[60vh] rounded-2xl overflow-hidden shadow-2xl relative bg-gray-100 dark:bg-gray-800">
                <MusicVisualizer
                    className="w-full h-full absolute inset-0"
                    cover={currentTrack.cover}
                    isPlaying={isPlaying}
                    bassLevel={bassLevel}
                    frequencies={frequencies}
                    theme={theme}
                />
            </div>
            
            <div className="w-full max-w-2xl mt-8 flex items-center justify-between">
                <div className="flex flex-col min-w-0 pr-4">
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white truncate">
                        {currentTrack.title}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-1 truncate">
                        {currentTrack.artist}
                    </p>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                    <button 
                        onClick={() => toggleFavorite(currentTrack.file)}
                        className={`p-3 rounded-full transition-colors ${isFav ? 'text-rose-500' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-rose-500'}`}
                    >
                        <Heart className={`w-7 h-7 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                    <button className="p-3 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                        <MoreVertical className="w-7 h-7" />
                    </button>
                </div>
            </div>
        </div>
    )
}
