import { useAudioLibrary, useAudioActions } from '../../../context/AudioContext'
import { ListMusic, Play } from 'lucide-react'
import { useMemo, useRef, useEffect } from 'react'

export default function QueuePanel() {
    const { playlist, currentTrackIndex } = useAudioLibrary()
    const { playTrack } = useAudioActions()
    const activeRef = useRef(null)

    // Scroll active item into view on load
    useEffect(() => {
        if (activeRef.current) {
            activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }, [currentTrackIndex])

    const fileIndexMap = useMemo(() => {
        const map = new Map()
        playlist.forEach((t, i) => map.set(t.file, i))
        return map
    }, [playlist])

    return (
        <aside className="w-full md:w-[350px] lg:w-[400px] h-full shrink-0 flex flex-col bg-white dark:bg-[#030303] border-l border-black/5 dark:border-white/10 relative z-10 pt-4 pb-2">
            
            <div className="px-6 mb-4 shrink-0 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tiếp theo</h2>
                <button className="text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                    Lưu
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 scrollbar-custom space-y-1 pb-10">
                {playlist.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                        <ListMusic className="w-8 h-8 opacity-50 mb-2" />
                        <span className="text-sm">Không có bài hát nào</span>
                    </div>
                )}
                
                {playlist.map((track, idx) => {
                    const originalIndex = fileIndexMap.get(track.file) ?? idx
                    const isActive = originalIndex === currentTrackIndex

                    return (
                        <div
                            key={track.file}
                            ref={isActive ? activeRef : null}
                            onClick={() => playTrack(originalIndex)}
                            className={`group flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors ${isActive ? 'bg-gray-100 dark:bg-white/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                        >
                            <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-800 shrink-0 relative">
                                {track.cover ? (
                                    <img src={track.cover} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ListMusic className="w-4 h-4 text-gray-400" />
                                    </div>
                                )}
                                
                                {/* Overlay play icon */}
                                {!isActive && (
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Play className="w-4 h-4 fill-white text-white" />
                                    </div>
                                )}
                                {isActive && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <div className="w-3 h-3 flex items-end gap-[2px]">
                                            <div className="w-[3px] bg-white animate-[bounce_0.8s_infinite] h-full"></div>
                                            <div className="w-[3px] bg-white animate-[bounce_1.1s_infinite] h-2/3"></div>
                                            <div className="w-[3px] bg-white animate-[bounce_0.9s_infinite] h-full"></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className={`text-[14px] font-bold truncate ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
                                    {track.title}
                                </h4>
                                <p className={`text-[12px] truncate ${isActive ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'}`}>
                                    {track.artist}
                                </p>
                            </div>

                            <span className="text-[12px] text-gray-500 pr-2">
                                {track.duration}
                            </span>
                        </div>
                    )
                })}
            </div>
        </aside>
    )
}
