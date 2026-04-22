import { useState } from 'react'
import { Search, ListMusic, Heart, Trash2 } from 'lucide-react'
import { useAudio } from '../../../context/AudioContext'
import ConfirmModal from '../../../components/ConfirmModal'

export default function Playlist() {
  const [search, setSearch] = useState('')
  const { playlist, currentTrackIndex, playTrack, favorites, toggleFavorite, isOnlyFavorites, setIsOnlyFavorites, deleteTrack } = useAudio()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [trackToDelete, setTrackToDelete] = useState(null)

  const filteredPlaylist = playlist.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(search.toLowerCase()) ||
      track.artist.toLowerCase().includes(search.toLowerCase());
    const matchesFavorite = isOnlyFavorites ? favorites.includes(track.file) : true;
    return matchesSearch && matchesFavorite;
  })

  const handleDeleteClick = (e, track) => {
    e.stopPropagation();
    setTrackToDelete(track);
    setIsDeleteModalOpen(true);
  }

  return (
    <div className="music-panel-shell flex flex-col h-full w-full">
      <div className="shrink-0 mb-3 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm bài hát..."
            className="music-panel-search w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-900/50 border-none text-[13px] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder-gray-400"
          />
        </div>
        <button
          onClick={() => setIsOnlyFavorites(!isOnlyFavorites)}
          className={`cursor-pointer p-3 rounded-2xl border transition-all ${isOnlyFavorites
            ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 text-rose-500'
            : 'bg-gray-100 dark:bg-gray-900/50 border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
        >
          <Heart className={`w-5 h-5 ${isOnlyFavorites ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Hiển thị tổng số bài hát */}
      <div className="shrink-0 flex items-center justify-between px-2 mb-2">
        <span className="music-panel-title text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {search || isOnlyFavorites ? 'Kết quả' : 'Tất cả bài hát'}
        </span>
        <span className="music-panel-badge text-[11px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
          {filteredPlaylist.length} / {playlist.length}
        </span>
      </div>

      <div className="flex-1 max-h-[400px] md:max-h-none md:h-auto overflow-y-auto space-y-2 pr-1 scrollbar-custom">
        {filteredPlaylist.map((track) => {
          const originalIndex = playlist.findIndex(t => t.file === track.file)
          const isActive = originalIndex === currentTrackIndex

          return (
            <div
              key={track.file}
              onClick={() => playTrack(originalIndex)}
              className={`group flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all border ${isActive
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 shadow-sm'
                : 'border-transparent hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
            >
              <div className="w-12 h-12 rounded-xl shrink-0 overflow-hidden shadow-sm relative">
                {track.cover ? (
                  <img src={track.cover} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-400">
                    <ListMusic size={20} />
                  </div>
                )}
              </div>

              {/* Thêm thuộc tính title vào thẻ chứa text để tự động hiện tooltip native khi hover */}
              <div className="flex-1 min-w-0" title={`${track.title}`}>
                <h4 className={`music-panel-item-title text-[13.5px] font-bold truncate ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-900 dark:text-gray-100'}`}>
                  {track.title}
                </h4>
                <p className={`music-panel-item-subtitle text-[11px] font-bold truncate mt-0.5 ${isActive ? 'text-emerald-600/70 dark:text-emerald-500/60' : 'text-gray-500 dark:text-gray-400'}`}>
                  {track.artist}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleDeleteClick(e, track)}
                    title="Xóa bài hát"
                    className="cursor-pointer p-1.5 text-gray-400 dark:text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 transition-all outline-none"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(track.file);
                    }}
                    title={favorites.includes(track.file) ? "Bỏ yêu thích" : "Yêu thích"}
                    className={`cursor-pointer p-1.5 transition-all outline-none transform hover:scale-125 ${favorites.includes(track.file)
                      ? 'text-rose-500 opacity-100'
                      : 'text-gray-400 dark:text-gray-600 opacity-0 group-hover:opacity-100 hover:text-rose-500'
                      }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${favorites.includes(track.file) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className={`text-[10px] font-black font-mono tracking-tighter ${isActive ? 'text-emerald-600/80 dark:text-emerald-400/80' : 'text-gray-500 dark:text-gray-500'}`}>
                  {track.duration}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (trackToDelete) {
            deleteTrack(trackToDelete.file);
            setTrackToDelete(null);
          }
        }}
        title="Xóa bài hát?"
        message={`Bạn có chắc chắn muốn xóa bài hát "${trackToDelete?.title}" khỏi bộ nhớ máy tính?`}
      />
    </div>
  )
}
