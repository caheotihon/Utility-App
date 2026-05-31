import { useEffect, useMemo, useState } from 'react'
import {
    Search,
    Heart,
    PlusCircle,
    Trash2,
    Play,
    PencilLine,
    ArrowLeft,
    ListMusic,
} from 'lucide-react'
import { useAudioLibrary, useAudioActions } from '../../../context/AudioContext'
import { usePlaylists } from '../../../context/PlaylistContext'
import AddToPlaylistModal from './AddToPlaylistModal'
import ConfirmModal from '../../../components/ConfirmModal'
import PlaylistModal from './PlaylistModal'

// Icon mặc định cho playlist trống được thiết kế lại theo tông màu Indigo cao cấp hơn
const emptyPlaylistIcon = (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/10">
        <ListMusic className="w-6 h-6 text-indigo-500" />
    </div>
)

export default function LibraryView({ activeTab, setActiveTab }) {
    const [search, setSearch] = useState('')
    const { playlist, favorites } = useAudioLibrary()
    const { playTrack, toggleFavorite, deleteTrack } = useAudioActions()
    const {
        playlists,
        createPlaylist,
        renamePlaylist,
        deletePlaylist,
        removeSongFromPlaylist,
        getPlaylistSongs,
        fetchPlaylists,
    } = usePlaylists() || {}

    const [selectedPlaylistId, setSelectedPlaylistId] = useState(null)
    const [playlistSongs, setPlaylistSongs] = useState([])
    const [isLoadingSongs, setIsLoadingSongs] = useState(false)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [renameTarget, setRenameTarget] = useState(null)
    const [deletePlaylistTarget, setDeletePlaylistTarget] = useState(null)
    const [deleteSongTarget, setDeleteSongTarget] = useState(null)
    const [addToPlaylistTrack, setAddToPlaylistTrack] = useState(null)
    const [trackToDelete, setTrackToDelete] = useState(null)

    const favoriteSet = useMemo(() => new Set(favorites), [favorites])
    const fileIndexMap = useMemo(() => {
        const map = new Map()
        playlist.forEach((t, i) => map.set(t.file, i))
        return map
    }, [playlist])

    useEffect(() => {
        if (activeTab.startsWith('playlist_')) {
            setSelectedPlaylistId(activeTab.replace('playlist_', ''))
            return
        }

        if (activeTab === 'library' || activeTab === 'home') {
            setSelectedPlaylistId(null)
            setPlaylistSongs([])
        }
    }, [activeTab])

    useEffect(() => {
        if (!selectedPlaylistId || !activeTab.startsWith('playlist_')) return
        if (!getPlaylistSongs) return

        setIsLoadingSongs(true)
        getPlaylistSongs(selectedPlaylistId, (songs) => {
            setPlaylistSongs(songs)
            setIsLoadingSongs(false)
        })
    }, [selectedPlaylistId, activeTab, getPlaylistSongs, playlists])

    useEffect(() => {
        if (!selectedPlaylistId || !playlists?.length) return
        const stillExists = playlists.some((pl) => pl.id === selectedPlaylistId)
        if (!stillExists && activeTab.startsWith('playlist_')) {
            setSelectedPlaylistId(null)
            setPlaylistSongs([])
            setActiveTab?.('library')
        }
    }, [playlists, selectedPlaylistId, activeTab, setActiveTab])

    const currentPlaylist = useMemo(
        () => playlists?.find((pl) => pl.id === selectedPlaylistId) || null,
        [playlists, selectedPlaylistId]
    )

    const query = search.trim().toLowerCase()

    const overviewPlaylists = useMemo(() => {
        const source = playlists || []
        if (!query) return source
        return source.filter((pl) => {
            const name = (pl.name || '').toLowerCase()
            return name.includes(query)
        })
    }, [playlists, query])

    const likedTracks = useMemo(() => {
        return playlist.filter((track) => {
            const matchesText =
                !query ||
                track.title.toLowerCase().includes(query) ||
                track.artist.toLowerCase().includes(query)
            return matchesText && favoriteSet.has(track.file)
        })
    }, [playlist, query, favoriteSet])

    const allTracks = useMemo(() => {
        return playlist.filter((track) => {
            if (!query) return true
            return (
                track.title.toLowerCase().includes(query) ||
                track.artist.toLowerCase().includes(query)
            )
        })
    }, [playlist, query])

    const visiblePlaylistSongs = useMemo(() => {
        return playlistSongs.filter((track) => {
            if (!query) return true
            return (
                track.title.toLowerCase().includes(query) ||
                track.artist.toLowerCase().includes(query)
            )
        })
    }, [playlistSongs, query])

    const handleOpenPlaylist = (playlistId) => {
        setSelectedPlaylistId(playlistId)
        setActiveTab?.(`playlist_${playlistId}`)
    }

    const handleCreatePlaylist = (name) => {
        createPlaylist?.(name, (pl) => {
            setSelectedPlaylistId(pl.id)
            setActiveTab?.(`playlist_${pl.id}`)
        })
        setIsCreateOpen(false)
    }

    const handleRenamePlaylist = (newName) => {
        if (!renameTarget) return
        renamePlaylist?.(renameTarget.id, newName)
        if (currentPlaylist?.id === renameTarget.id) {
            setSelectedPlaylistId(renameTarget.id)
        }
        setRenameTarget(null)
        fetchPlaylists?.()
    }

    const handleDeletePlaylist = () => {
        if (!deletePlaylistTarget) return
        deletePlaylist?.(deletePlaylistTarget.id)
        setDeletePlaylistTarget(null)
        if (selectedPlaylistId === deletePlaylistTarget.id) {
            setSelectedPlaylistId(null)
            setPlaylistSongs([])
            setActiveTab?.('library')
        }
        fetchPlaylists?.()
    }

    const handleRemoveSong = () => {
        if (!deleteSongTarget) return
        removeSongFromPlaylist?.(deleteSongTarget.playlistId, deleteSongTarget.song.file)
        setDeleteSongTarget(null)
        getPlaylistSongs?.(deleteSongTarget.playlistId, (songs) => setPlaylistSongs(songs))
    }

    // Thiết kế lại Card bài hát chuyên nghiệp, tăng diện tích bấm, gom cụm nút chức năng mịn hơn
    const renderSongCard = (track, onRemoveFromPlaylist = null) => {
        const originalIndex = fileIndexMap.get(track.file) ?? -1
        const isFav = favoriteSet.has(track.file)

        return (
            <div
                key={track.file}
                onClick={() => originalIndex >= 0 && playTrack(originalIndex)}
                className="group flex items-center gap-3.5 p-3 rounded-2xl bg-white dark:bg-[#121620] hover:bg-indigo-50/40 dark:hover:bg-indigo-500/[0.03] border border-black/[0.03] dark:border-white/5 hover:border-indigo-500/20 dark:hover:border-indigo-500/20 transition-all duration-200 shadow-sm"
            >
                {/* Ảnh cover nghệ thuật kèm hiệu ứng Play mượt mà */}
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 relative bg-gray-100 dark:bg-[#1a202c] shadow-sm">
                    {track.cover ? (
                        <img src={track.cover} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" alt="" />
                    ) : (
                        emptyPlaylistIcon
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                        <Play className="w-4 h-4 fill-white text-white scale-90 group-hover:scale-100 transition-transform duration-200" />
                    </div>
                </div>

                {/* Thông tin văn bản bài hát */}
                <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] xs:text-[14px] font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {track.title}
                    </h4>
                    <p className="text-[11px] xs:text-[12px] text-gray-400 dark:text-gray-500 truncate mt-0.5 font-medium">
                        {track.artist || 'Không rõ nghệ sĩ'}
                    </p>
                </div>

                {/* Khối nút thao tác nhanh bên phải: Responsive ẩn/hiện tinh tế */}
                <div className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                    {onRemoveFromPlaylist ? (
                        <button
                            title="Xóa khỏi danh sách phát này"
                            onClick={(e) => {
                                e.stopPropagation()
                                onRemoveFromPlaylist(track)
                            }}
                            className="p-2 rounded-xl text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors active:scale-95"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            title="Xóa vĩnh viễn tệp tin khỏi máy tính"
                            onClick={(e) => {
                                e.stopPropagation()
                                setTrackToDelete(track)
                            }}
                            className="p-2 rounded-xl text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors active:scale-95"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}

                    <button
                        title={isFav ? "Bỏ thích" : "Yêu thích bài hát này"}
                        onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(track.file)
                        }}
                        className={`p-2 rounded-xl transition-all active:scale-90 ${
                            isFav 
                                ? 'text-rose-500 bg-rose-500/10 opacity-100' 
                                : 'text-gray-400 hover:text-rose-500 hover:bg-rose-500/5'
                        }`}
                    >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-current animate-in zoom-in-75' : ''}`} />
                    </button>

                    {!onRemoveFromPlaylist && (
                        <button
                            title="Thêm bài hát này vào playlist cá nhân"
                            onClick={(e) => {
                                e.stopPropagation()
                                setAddToPlaylistTrack(track)
                            }}
                            className="p-2 rounded-xl text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors active:scale-95"
                        >
                            <PlusCircle className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        )
    }

    const renderOverview = () => (
        <div className="flex flex-col w-full h-full max-w-6xl mx-auto p-1 select-none animate-in fade-in-50 duration-200">
            {/* Header tổng quan Thư mục nhạc */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-black/5 dark:border-white/5 pb-4">
                <div>
                    <h1 className="text-sm lg:text-xl font-black text-gray-900 dark:text-white uppercase tracking-wider">
                        Danh sách phát
                    </h1>
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1 font-mono">
                        {overviewPlaylists.length} PLAYLISTS CÁ NHÂN
                    </p>
                </div>

                {/* Tìm kiếm & Tạo playlist */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full md:w-auto">
                    <div className="relative w-full md:w-64 shrink-0">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 pointer-events-none" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm kiếm danh sách phát..."
                            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#161b26] border border-black/5 dark:border-white/10 text-xs xs:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 focus:bg-white dark:focus:bg-[#111622] transition-all placeholder-gray-400 shadow-inner"
                        />
                    </div>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs xs:text-sm font-bold transition-all active:scale-95 shadow-md shadow-indigo-600/10"
                    >
                        Tạo playlist
                    </button>
                </div>
            </div>

            {/* Trạng thái trống */}
            {overviewPlaylists.length === 0 ? (
                <div className="flex-1 min-h-[280px] flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/5 bg-gray-50/20 dark:bg-white/[0.01] text-gray-400">
                    <ListMusic className="w-12 h-12 text-gray-300 dark:text-gray-700 stroke-[1.5]" />
                    <p className="text-xs xs:text-sm font-semibold">Chưa tìm thấy danh sách phát nào.</p>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="mt-1 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-all active:scale-95"
                    >
                        Tạo playlist đầu tiên
                    </button>
                </div>
            ) : (
                /* Grid hiển thị Playlist */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
                    {overviewPlaylists.map((pl) => (
                        <div
                            key={pl.id}
                            onClick={() => handleOpenPlaylist(pl.id)}
                            className="group flex flex-col gap-3 p-4 rounded-3xl bg-white dark:bg-[#121620] hover:bg-indigo-50/30 dark:hover:bg-indigo-500/[0.02] border border-black/[0.03] dark:border-white/10 hover:border-indigo-500/20 dark:hover:border-indigo-500/20 transition-all duration-200 cursor-pointer shadow-sm relative overflow-hidden"
                        >
                            {/* Khung Thumbnail Playlist thiết kế dạng bìa kính album */}
                            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600/15 via-purple-500/5 to-indigo-500/20 shadow-inner flex items-center justify-center">
                                <ListMusic className="w-10 h-10 text-indigo-500/60 transform group-hover:scale-110 transition-transform duration-300" />
                                
                                {/* Nút quản lý nhanh nổi trên thẻ Playlist */}
                                <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setRenameTarget(pl)
                                        }}
                                        className="p-2 rounded-xl bg-white/95 dark:bg-[#161b26]/95 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-black/5 dark:border-white/5 transition-colors shadow-sm"
                                        title="Sửa tên playlist"
                                    >
                                        <PencilLine className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setDeletePlaylistTarget(pl)
                                        }}
                                        className="p-2 rounded-xl bg-white/95 dark:bg-[#161b26]/95 text-gray-600 dark:text-gray-300 hover:text-rose-500 border border-black/5 dark:border-white/5 transition-colors shadow-sm"
                                        title="Xóa playlist"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Tên danh sách và số lượng bài phát */}
                            <div className="flex items-center justify-between gap-2 px-1">
                                <div className="min-w-0">
                                    <h4 className="text-[14px] xs:text-[15px] font-black text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {pl.name}
                                    </h4>
                                    <p className="text-[11px] xs:text-[12px] text-gray-400 dark:text-gray-500 mt-0.5 font-medium font-mono">
                                        {pl.song_count || 0} TRACKS
                                    </p>
                                </div>
                                <span className="text-[11px] font-bold text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-lg shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                                    MỞ
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )

    const renderPlaylistDetail = () => (
        <div className="flex flex-col w-full h-full max-w-6xl mx-auto p-1 select-none animate-in fade-in-50 duration-200">
            {/* Thanh điều hướng quay lại & quản trị playlist */}
            <div className="flex flex-col gap-4 mb-6 border-b border-black/5 dark:border-white/5 pb-4">
                <div className="flex items-center justify-between gap-3">
                    <button
                        onClick={() => setActiveTab?.('library')}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gray-50 dark:bg-[#161b26] border border-black/5 dark:border-white/10 text-xs xs:text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors active:scale-95 shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại
                    </button>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setRenameTarget(currentPlaylist)}
                            className="p-2 rounded-xl bg-gray-50 dark:bg-[#161b26] border border-black/5 dark:border-white/10 text-gray-400 hover:text-indigo-600 transition-colors active:scale-95 shadow-sm"
                            title="Sửa tên playlist"
                        >
                            <PencilLine className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setDeletePlaylistTarget(currentPlaylist)}
                            className="p-2 rounded-xl bg-gray-50 dark:bg-[#161b26] border border-black/5 dark:border-white/10 text-gray-400 hover:text-rose-500 transition-colors active:scale-95 shadow-sm"
                            title="Xóa playlist"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Tiêu đề Playlist & Thao tác nhạc */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-sm lg:text-xl font-black text-gray-900 dark:text-white truncate max-w-xl">
                            {currentPlaylist?.name || 'Danh sách phát'}
                        </h1>
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1 font-mono">
                            {playlistSongs.length} BÀI HÁT TRONG PLAYLIST
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full md:w-auto">
                        <div className="relative w-full md:w-64 shrink-0">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Tìm bài hát trong playlist này..."
                                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#161b26] border border-black/5 dark:border-white/10 text-xs xs:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 focus:bg-white dark:focus:bg-[#111622] transition-all placeholder-gray-400 shadow-inner"
                            />
                        </div>
                        <button
                            onClick={() => setActiveTab?.('home')}
                            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs xs:text-sm font-bold transition-all active:scale-95 shadow-md shadow-indigo-600/10 whitespace-nowrap"
                        >
                            Thêm nhạc từ thư viện
                        </button>
                    </div>
                </div>
            </div>

            {/* Vùng Content bài hát của Playlist */}
            {isLoadingSongs ? (
                <div className="py-20 flex flex-col items-center justify-center text-gray-400 text-xs font-bold font-mono tracking-wider gap-2">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    ĐANG TẢI DỮ LIỆU...
                </div>
            ) : visiblePlaylistSongs.length === 0 ? (
                <div className="flex-1 min-h-[280px] flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/5 bg-gray-50/20 dark:bg-white/[0.01] text-gray-400">
                    <ListMusic className="w-12 h-12 text-gray-300 dark:text-gray-700 stroke-[1.5]" />
                    <p className="text-xs xs:text-sm font-semibold">Playlist này chưa có bài hát.</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 max-w-xs text-center px-4">Hãy nhấn nút Thêm nhạc phía trên hoặc quay lại trang chủ để đưa các giai điệu yêu thích vào đây.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pb-12">
                    {visiblePlaylistSongs.map((track) =>
                        renderSongCard(track, (song) => setDeleteSongTarget({ playlistId: selectedPlaylistId, song }))
                    )}
                </div>
            )}
        </div>
    )

    const renderLikedTracks = () => (
        <div className="flex flex-col w-full h-full max-w-6xl mx-auto p-1 select-none animate-in fade-in-50 duration-200">
            {/* Header chuyên mục Bài hát đã thích */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-black/5 dark:border-white/5 pb-4">
                <div>
                    <h1 className="text-sm lg:text-xl font-black text-gray-900 dark:text-white uppercase tracking-wider">
                        Bài hát ưa thích
                    </h1>
                    <p className="text-xs font-bold text-rose-500 mt-1 font-mono uppercase tracking-wide">
                        {likedTracks.length} Giai điệu tâm đắc
                    </p>
                </div>

                <div className="relative w-full md:w-64 shrink-0">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Lọc bài hát đã thích..."
                        className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#161b26] border border-black/5 dark:border-white/10 text-xs xs:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500/40 focus:bg-white dark:focus:bg-[#111622] transition-all placeholder-gray-400 shadow-inner"
                    />
                </div>
            </div>

            {/* Danh sách bài hát đã thích */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pb-12">
                {likedTracks.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 gap-2">
                        <Heart className="w-10 h-10 opacity-30 stroke-[1.5]" />
                        <p className="text-xs font-semibold">Không tìm thấy bài hát yêu thích nào.</p>
                    </div>
                ) : (
                    likedTracks.map((track) => renderSongCard(track))
                )}
            </div>
        </div>
    )

    const renderAllTracks = () => (
        <div className="flex flex-col w-full h-full max-w-6xl mx-auto p-1 select-none animate-in fade-in-50 duration-200">
            {/* Header tổng kho thư viện nhạc */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-black/5 dark:border-white/5 pb-4">
                <div>
                    <h1 className="text-sm lg:text-xl font-black text-gray-900 dark:text-white uppercase tracking-wider">
                        Thư viện nhạc
                    </h1>
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1 font-mono">
                        {allTracks.length} BÀI HÁT TRÊN MÁY
                    </p>
                </div>

                <div className="relative w-full md:w-64 shrink-0">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm tên bài hát hoặc ca sĩ..."
                        className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#161b26] border border-black/5 dark:border-white/10 text-xs xs:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 focus:bg-white dark:focus:bg-[#111622] transition-all placeholder-gray-400 shadow-inner"
                    />
                </div>
            </div>

            {/* Grid hiển thị tất cả các bài hát */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pb-12">
                {allTracks.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 gap-2">
                        <ListMusic className="w-10 h-10 opacity-30 stroke-[1.5]" />
                        <p className="text-xs font-semibold">Thư viện trống hoặc từ khóa tìm kiếm không khớp.</p>
                    </div>
                ) : (
                    allTracks.map((track) => renderSongCard(track))
                )}
            </div>
        </div>
    )

    const renderContent = () => {
        if (activeTab === 'liked') return renderLikedTracks()
        if (activeTab.startsWith('playlist_')) return renderPlaylistDetail()
        if (activeTab === 'library') return renderOverview()
        return renderAllTracks()
    }

    return (
        <>
            {renderContent()}

            {/* Hệ thống Quản lý Popups & Modals */}
            <ConfirmModal
                isOpen={!!deletePlaylistTarget}
                onClose={() => setDeletePlaylistTarget(null)}
                onConfirm={handleDeletePlaylist}
                title="Xóa playlist?"
                message={`Bạn có chắc chắn muốn xóa playlist "${deletePlaylistTarget?.name}" không?`}
            />

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
                message={`Bạn có chắc chắn muốn xóa bài hát "${trackToDelete?.title}" khỏi máy tính?`}
            />

            <ConfirmModal
                isOpen={!!deleteSongTarget}
                onClose={() => setDeleteSongTarget(null)}
                onConfirm={handleRemoveSong}
                title="Xóa khỏi playlist?"
                message={`Bài hát "${deleteSongTarget?.song?.title}" sẽ bị xóa khỏi playlist này.`}
            />

            <PlaylistModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onConfirm={handleCreatePlaylist}
                title="Tạo playlist mới"
            />

            <PlaylistModal
                isOpen={!!renameTarget}
                onClose={() => setRenameTarget(null)}
                onConfirm={handleRenamePlaylist}
                initialName={renameTarget?.name || ''}
                title="Sửa tên playlist"
            />

            <AddToPlaylistModal
                isOpen={!!addToPlaylistTrack}
                onClose={() => setAddToPlaylistTrack(null)}
                track={addToPlaylistTrack}
            />
        </>
    )
}