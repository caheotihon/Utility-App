/**
 * AddToPlaylistModal — Popup để thêm bài hát vào playlist(s)
 */

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-black/5 dark:border-white/10 p-6 animate-in zoom-in-95 fade-in">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
                    <X className="w-4 h-4" />
                </button>

                <div className="mb-5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Thêm vào playlist</h2>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1 truncate">{track.title}</p>
                </div>

                <div className="flex flex-col gap-1 max-h-48 overflow-y-auto mb-4 pr-1">
                    {playlists?.length === 0 && (
                        <p className="text-center text-sm text-gray-400 py-4">Chưa có playlist nào.</p>
                    )}
                    {playlists?.map(pl => {
                        const added = addedIds.has(pl.id)
                        return (
                            <button
                                key={pl.id}
                                onClick={() => !added && handleAdd(pl.id)}
                                disabled={added}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${added
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                <ListMusic className="w-4 h-4 shrink-0" />
                                <span className="flex-1 text-sm font-medium truncate">{pl.name}</span>
                                <span className="text-[11px] text-gray-400">{pl.songs?.length || 0} bài</span>
                                {added && <Check className="w-4 h-4 text-emerald-500" />}
                            </button>
                        )
                    })}
                </div>

                {creating ? (
                    <form onSubmit={handleCreate} className="flex gap-2">
                        <input
                            autoFocus
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Tên playlist mới..."
                            className="flex-1 px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm border-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-gray-900 dark:text-white"
                        />
                        <button type="submit" className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-all">
                            Tạo
                        </button>
                        <button type="button" onClick={() => setCreating(false)} className="px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                            <X className="w-4 h-4" />
                        </button>
                    </form>
                ) : (
                    <button
                        onClick={() => setCreating(true)}
                        className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 hover:border-emerald-400 hover:text-emerald-500 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Tạo playlist mới
                    </button>
                )}
            </div>
        </div>
    )
}
