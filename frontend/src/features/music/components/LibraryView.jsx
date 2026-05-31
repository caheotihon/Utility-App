import { useState, useMemo, useCallback } from 'react'
import { Search, Heart, PlusCircle, Trash2, Play } from 'lucide-react'
import { useAudioLibrary, useAudioActions } from '../../../context/AudioContext'
import AddToPlaylistModal from './AddToPlaylistModal'
import ConfirmModal from '../../../components/ConfirmModal'

export default function LibraryView({ activeTab }) {
    const [search, setSearch] = useState('')
    const { playlist, favorites } = useAudioLibrary()
    const { playTrack, toggleFavorite, deleteTrack } = useAudioActions()
    const [addToPlaylistTrack, setAddToPlaylistTrack] = useState(null)
    const [trackToDelete, setTrackToDelete] = useState(null)

    // Lọc theo search và activeTab (liked vs tất cả)
    const filteredPlaylist = useMemo(() => {
        const favoriteSet = new Set(favorites)
        return playlist.filter(track => {
            const matchesSearch = track.title.toLowerCase().includes(search.toLowerCase()) ||
                track.artist.toLowerCase().includes(search.toLowerCase())
            const matchesTab = activeTab === 'liked' ? favoriteSet.has(track.file) : true
            // TODO: Lọc theo playlist_id nếu activeTab dạng 'playlist_123'
            return matchesSearch && matchesTab
        })
    }, [playlist, search, favorites, activeTab])

    const favoriteSet = useMemo(() => new Set(favorites), [favorites])
    const fileIndexMap = useMemo(() => {
        const map = new Map()
        playlist.forEach((t, i) => map.set(t.file, i))
        return map
    }, [playlist])

    const handleAddToPlaylist = useCallback((e, track) => {
        e.stopPropagation()
        setAddToPlaylistTrack(track)
    }, [])

    const handleDeleteClick = useCallback((e, track) => {
        e.stopPropagation()
        setTrackToDelete(track)
    }, [])

    return (
        <div className="flex flex-col w-full h-full max-w-6xl mx-auto">
            {/* Header của LibraryView */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white capitalize">
                        {activeTab === 'home' || activeTab === 'library' ? 'Thư viện của bạn' : 
                         activeTab === 'liked' ? 'Bài hát đã thích' : 'Danh sách phát'}
                    </h1>
                    <p className="text-sm font-medium text-gray-500 mt-2">
                        {filteredPlaylist.length} bài hát
                    </p>
                </div>

                <div className="relative w-full md:w-64 shrink-0">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Lọc danh sách..."
                        className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-black/5 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Grid bài hát */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pb-12">
                {filteredPlaylist.length === 0 && (
                    <div className="col-span-full py-20 flex justify-center text-gray-400 text-sm">
                        Không tìm thấy bài hát nào.
                    </div>
                )}
                {filteredPlaylist.map(track => {
                    const originalIndex = fileIndexMap.get(track.file) ?? -1
                    const isFav = favoriteSet.has(track.file)

                    return (
                        <div 
                            key={track.file}
                            onClick={() => playTrack(originalIndex)}
                            className="group flex items-center gap-4 p-3 rounded-2xl bg-white dark:bg-[#121212] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 transition-all cursor-pointer"
                        >
                            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 relative bg-gray-100 dark:bg-gray-800">
                                {track.cover ? (
                                    <img src={track.cover} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Play className="w-5 h-5" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Play className="w-6 h-6 fill-white text-white" />
                                </div>
                            </div>
                            
                            <div className="flex-1 min-w-0 pr-2">
                                <h4 className="text-[14px] font-bold text-gray-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    {track.title}
                                </h4>
                                <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                    {track.artist}
                                </p>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                                <button 
                                    title="Xóa bài hát"
                                    onClick={(e) => handleDeleteClick(e, track)}
                                    className="p-2 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleFavorite(track.file) }}
                                    className={`p-2 rounded-full transition-colors ${isFav ? 'text-rose-500 opacity-100' : 'text-gray-400 hover:text-rose-500'}`}
                                >
                                    <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                                </button>
                                <button 
                                    onClick={(e) => handleAddToPlaylist(e, track)}
                                    className="p-2 rounded-full text-gray-400 hover:text-emerald-500 transition-colors"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            <ConfirmModal
                isOpen={!!trackToDelete}
                onClose={() => setTrackToDelete(null)}
                onConfirm={() => {
                    if (trackToDelete) {
                        deleteTrack(trackToDelete.file)
                        setTrackToDelete(null)
                    }
                }}
                title="Xóa bài hát?"
                message={`Bạn có chắc chắn muốn xóa bài hát "${trackToDelete?.title}" khỏi bộ nhớ máy tính?`}
            />

            <AddToPlaylistModal
                isOpen={!!addToPlaylistTrack}
                onClose={() => setAddToPlaylistTrack(null)}
                track={addToPlaylistTrack}
            />
        </div>
    )
}
