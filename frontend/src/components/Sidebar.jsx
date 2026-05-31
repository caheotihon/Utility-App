import { Home, Library, Plus, Heart, ListMusic, Download } from 'lucide-react'
import { usePlaylists } from '../context/PlaylistContext'
import PlaylistModal from '../features/music/components/PlaylistModal'
import { useState } from 'react'

export default function Sidebar({ activeTab, setActiveTab }) {
    const { playlists, createPlaylist } = usePlaylists() || {}
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    const handleCreate = (name) => {
        createPlaylist?.(name)
    }

    return (
        <aside className="w-[240px] hidden md:flex flex-col bg-white dark:bg-[#030303] h-full shrink-0 border-r border-black/5 dark:border-white/10 z-10 py-4">
            
            {/* Top Navigation */}
            <div className="flex flex-col px-3 gap-1 mb-6">
                <button 
                    onClick={() => setActiveTab('home')}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'home' ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                    <Home className={`w-5 h-5 ${activeTab === 'home' ? 'text-emerald-500' : ''}`} />
                    Trang chủ
                </button>
                <button 
                    onClick={() => setActiveTab('library')}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'library' ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                    <Library className={`w-5 h-5 ${activeTab === 'library' ? 'text-emerald-500' : ''}`} />
                    Thư viện
                </button>
                <button 
                    onClick={() => setActiveTab('downloader')}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'downloader' ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                    <Download className={`w-5 h-5 ${activeTab === 'downloader' ? 'text-emerald-500' : ''}`} />
                    Tải nhạc
                </button>
            </div>

            <hr className="border-black/5 dark:border-white/10 mx-6 mb-4" />

            {/* Playlists Section */}
            <div className="flex items-center justify-between px-6 mb-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Danh sách phát</h3>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all"
                    title="Tạo playlist mới"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-custom px-3 flex flex-col gap-1 pb-4">
                <button 
                    onClick={() => setActiveTab('liked')}
                    className={`flex items-center gap-4 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'liked' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                    <Heart className={`w-5 h-5 ${activeTab === 'liked' ? 'fill-current text-rose-500' : ''}`} />
                    Đã thích
                </button>

                {playlists?.map(pl => (
                    <button
                        key={pl.id}
                        onClick={() => setActiveTab(`playlist_${pl.id}`)}
                        className={`flex items-center gap-4 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === `playlist_${pl.id}` ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                    >
                        <ListMusic className="w-5 h-5 shrink-0 opacity-70" />
                        <span className="truncate">{pl.name}</span>
                    </button>
                ))}
            </div>

            <PlaylistModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onConfirm={handleCreate}
                title="Tạo danh sách phát"
            />
        </aside>
    )
}
