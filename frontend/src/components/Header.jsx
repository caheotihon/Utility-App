import { useState } from 'react'
import { Search, Sun, Moon } from 'lucide-react'
import Avatar from './Avatar'
import ProfileModal from './ProfileModal'
import { useTheme } from '../context/ThemeContext'

export default function Header() {
    const { theme, toggleTheme } = useTheme()
    const [search, setSearch] = useState('')
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [avatarSrc, setAvatarSrc] = useState(() => localStorage.getItem('user_avatar') || null)
    const [userName, setUserName] = useState(() => localStorage.getItem('user_name') || 'Lofi Listener')

    return (
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 bg-white dark:bg-[#030303] text-gray-900 dark:text-white shrink-0 z-50">
            {/* Left: Logo */}
            <div className="flex items-center gap-2 min-w-[200px]">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    LM
                </div>
                <span className="font-bold text-lg hidden sm:block tracking-tight">Lofi Music</span>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-2xl mx-4 flex items-center justify-center">
                <div className="relative w-full max-w-xl group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 pointer-events-none" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm bài hát, nghệ sĩ..."
                        className="w-full pl-12 pr-4 py-2.5 rounded-full bg-gray-100 dark:bg-white/10 border border-transparent dark:border-white/10 focus:bg-white dark:focus:bg-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm outline-none placeholder-gray-500 dark:placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-[120px] justify-end">
                <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
                <button onClick={() => setIsProfileOpen(true)} className="p-0.5 rounded-full hover:ring-2 ring-emerald-500 transition-all cursor-pointer">
                    <Avatar src={avatarSrc} className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10" />
                </button>
            </div>

            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                avatarSrc={avatarSrc}
                onAvatarUpdate={(src) => {
                    setAvatarSrc(src)
                    localStorage.setItem('user_avatar', src)
                }}
                onNameUpdate={(name) => {
                    setUserName(name)
                    localStorage.setItem('user_name', name)
                }}
            />
        </header>
    )
}
