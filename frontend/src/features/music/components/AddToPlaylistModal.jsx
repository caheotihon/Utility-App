import { useState } from 'react'
import { X, Plus, Check, ListMusic } from 'lucide-react'
import { usePlaylists } from '../../../context/PlaylistContext'

export default function AddToPlaylistModal({ isOpen, onClose, track }) {
    const { playlists, addSongToPlaylist, createPlaylist } = usePlaylists() || {}
    const [newName, setNewName] = useState('')
    const [creating, setCreating] = useState(false)
    const [addedIds, setAddedIds] = useState(new Set())

    if (!isOpen || !track) return null

    const handleAdd = (playlistId) => {
        addSongToPlaylist?.(playlistId, track.file)
        setAddedIds(prev => new Set([...prev, playlistId]))
    }

    const handleCreate = (e) => {
        e.preventDefault()
        const trimmed = newName.trim()
        if (!trimmed) return
        createPlaylist?.(trimmed)
        setNewName('')
        setCreating(false)
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 select-none">
            {/* Lớp nền mờ mịn cao cấp */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

            {/* Khung Modal chính: Responsive kích thước mượt mà */}
            <div className="relative w-full max-w-[340px] xs:max-w-sm bg-white dark:bg-[#121620] rounded-[28px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-black/5 dark:border-white/10 p-5 sm:p-6 animate-in zoom-in-95 fade-in duration-200">
                
                {/* Nút Đóng Modal */}
                <button 
                    title="Đóng cửa sổ"
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Tiêu đề Modal: Tự thu nhỏ chữ trên màn hình hẹp */}
                <div className="mb-4 pr-8">
                    <h2 className="text-sm xs:text-base font-black text-gray-900 dark:text-white uppercase tracking-wider">
                        Thêm vào playlist
                    </h2>
                    <p className="text-[11px] xs:text-xs text-gray-400 dark:text-gray-500 mt-1 truncate font-medium">
                        Bài hát: <span className="text-gray-700 dark:text-gray-300">{track.title}</span>
                    </p>
                </div>

                {/* Danh sách Playlist: Ẩn hoàn toàn scrollbar thô cứng */}
                <div className="flex flex-col gap-2 max-h-52 overflow-y-auto mb-4 pr-0.5 scrollbar-none">
                    {playlists?.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-6 text-gray-400 dark:text-gray-600 gap-2">
                            <ListMusic className="w-8 h-8 opacity-40 stroke-[1.5]" />
                            <p className="text-xs font-medium">Chưa có danh sách phát nào.</p>
                        </div>
                    )}
                    
                    {playlists?.map(pl => {
                        const added = addedIds.has(pl.id)
                        const songCount = pl.song_count ?? pl.songs?.length ?? 0
                        return (
                            <button
                                key={pl.id}
                                title={added ? "Đã nằm trong danh sách này" : `Thêm vào playlist ${pl.name}`}
                                onClick={() => !added && handleAdd(pl.id)}
                                disabled={added}
                                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left border transition-all active:scale-[0.99] ${added
                                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold'
                                    : 'bg-gray-50/50 dark:bg-white/[0.02] border-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 hover:border-black/5 dark:hover:border-white/5'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${added ? 'bg-indigo-500/20' : 'bg-white dark:bg-[#161b26] border border-black/5 dark:border-white/10'}`}>
                                    <ListMusic className={`w-4 h-4 shrink-0 ${added ? 'text-indigo-500' : 'text-gray-400 dark:text-gray-500'}`} />
                                </div>
                                <span className="flex-1 text-xs xs:text-sm font-semibold truncate pr-1">{pl.name}</span>
                                <span className="text-[10px] xs:text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap">{songCount} bài</span>
                                {added && <Check className="w-4 h-4 text-indigo-500 shrink-0 ml-1 animate-in zoom-in-50 duration-200" />}
                            </button>
                        )
                    })}
                </div>

                {/* Khu vực tạo Playlist mới */}
                {creating ? (
                    <form onSubmit={handleCreate} className="flex gap-1.5 animate-in slide-in-from-bottom-2 duration-200">
                        <input
                            autoFocus
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Nhập tên playlist mới..."
                            className="flex-1 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-[#161b26] text-xs xs:text-sm border border-black/5 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                        />
                        <button 
                            title="Xác nhận tạo"
                            type="submit" 
                            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs xs:text-sm font-bold hover:bg-indigo-500 active:scale-95 transition-all shrink-0"
                        >
                            Tạo
                        </button>
                        <button 
                            title="Hủy bỏ"
                            type="button" 
                            onClick={() => setCreating(false)} 
                            className="px-2.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#161b26] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border border-black/5 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-95 shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </form>
                ) : (
                    <button
                        title="Mở khung tạo danh sách phát mới"
                        onClick={() => setCreating(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-dashed border-gray-300 dark:border-white/10 bg-gray-50/20 dark:bg-white/[0.01] text-xs xs:text-sm font-semibold text-gray-500 dark:text-gray-400 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-500/[0.02] dark:hover:bg-indigo-500/[0.02] transition-all active:scale-[0.99]"
                    >
                        <Plus className="w-4 h-4" />
                        Tạo playlist mới
                    </button>
                )}
            </div>
        </div>
    )
}