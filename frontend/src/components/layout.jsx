import React, { useState, useEffect } from 'react'
import { Music, Sun, Moon, Shrink, Download, TrendingUp, History, Brain } from 'lucide-react'
import Avatar from './Avatar'
import ProfileModal from './ProfileModal'
import { useTheme } from '../context/ThemeContext'
import { useAudioPlayback } from '../context/AudioContext'

export default function Layout({ children, activeFeature, setActiveFeature }) {
    const { isMiniPlayer } = useAudioPlayback() || {};
    const { theme, toggleTheme } = useTheme();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [avatarSrc, setAvatarSrc] = useState(() => {
        return localStorage.getItem('user_avatar') || null;
    });
    const [userName, setUserName] = useState(() => {
        return localStorage.getItem('user_name') || 'Tài Konn';
    });

    useEffect(() => {
        if (avatarSrc) {
            localStorage.setItem('user_avatar', avatarSrc);
        }
    }, [avatarSrc]);



    return (
        <div className="h-screen w-full bg-gray-50 dark:bg-[#0b0e14] text-gray-900 dark:text-gray-100 flex flex-col md:flex-row overflow-hidden font-sans transition-colors duration-300 md:gap-0 gap-3">

            {/* Navigation */}
            {!isMiniPlayer && (
            <nav className="order-2 md:order-1 w-full md:w-24 lg:w-64 bg-white/90 dark:bg-gray-900/50 backdrop-blur-xl border-t md:border-t-0 md:border-r border-black/5 dark:border-white/10 z-50 shrink-0 pb-[env(safe-area-inset-bottom)]">
                <div className="flex flex-row md:flex-col items-center justify-between md:justify-start h-16 md:h-full py-0 md:py-8 px-6 md:px-0 gap-0 md:gap-6 lg:gap-8">

                    {/* Avatar & Name */}
                    <div className="hidden md:flex flex-col items-center lg:items-start lg:px-6 w-full shrink-0 mb-4 cursor-pointer group relative" onClick={() => setIsProfileOpen(true)}>
                        <div className="flex flex-col lg:flex-row items-center gap-3">
                            <Avatar
                                src={avatarSrc}
                                className="group-hover:ring-4 group-hover:ring-blue-500/20 transition-all"
                            />
                            <div className="hidden lg:flex flex-col min-w-0">
                                <span className="text-sm font-bold truncate text-gray-900 dark:text-white">{userName}</span>
                                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Vip Pro</span>
                            </div>
                        </div>
                        {/* Tooltip cho Tablet */}
                        <span className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 lg:group-hover:opacity-0 transition-opacity whitespace-nowrap z-[60] pointer-events-none shadow-xl border border-white/10">
                            Hồ sơ: {userName}
                        </span>
                    </div>

                    {/* Mobile Navigation (Flat list) */}
                    <div className="md:hidden flex flex-row items-center justify-between w-full px-2">
                        <button onClick={() => setActiveFeature('music')} className={`p-2 rounded-xl ${activeFeature === 'music' ? 'text-blue-600 bg-blue-500/10' : 'text-gray-400'}`}>
                            <Music className="w-6 h-6" />
                        </button>
                        <button onClick={() => setActiveFeature('stats')} className={`p-2 rounded-xl ${activeFeature === 'stats' ? 'text-blue-600 bg-blue-500/10' : 'text-gray-400'}`}>
                            <TrendingUp className="w-6 h-6" />
                        </button>
                        <button onClick={() => setActiveFeature('history')} className={`p-2 rounded-xl ${activeFeature === 'history' ? 'text-blue-600 bg-blue-500/10' : 'text-gray-400'}`}>
                            <History className="w-6 h-6" />
                        </button>
                        <button onClick={toggleTheme} className="p-2 rounded-xl text-gray-400">
                            {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                        </button>
                        <button onClick={() => window.eel && window.eel.minimize_to_tray()} className="p-2 rounded-xl text-gray-400">
                            <Shrink className="w-6 h-6" />
                        </button>
                        <button onClick={() => setIsProfileOpen(true)} className="p-1">
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-black/10 dark:border-white/20">
                                {avatarSrc ? <img src={avatarSrc} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-300 dark:bg-gray-700" />}
                            </div>
                        </button>
                    </div>

                    {/* Desktop Navigation (Grouped) */}
                    <div className="hidden md:flex flex-col items-center justify-start w-full gap-4 lg:px-3">
                        {[
                            { id: 'music', icon: Music, label: 'Âm nhạc' },
                            { id: 'stats', icon: TrendingUp, label: 'Thống kê' },
                            { id: 'history', icon: History, label: 'Lịch sử' }
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveFeature(item.id)}
                                className={`flex flex-col lg:flex-row items-center justify-center lg:justify-start py-3 lg:px-4 rounded-2xl transition-all relative group cursor-pointer w-full gap-3 ${
                                    activeFeature === item.id 
                                    ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10' 
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'
                                }`}
                            >
                                <item.icon className={`w-7 lg:w-5 h-7 lg:h-5 transition-all duration-300 ${activeFeature === item.id ? 'scale-110' : ''}`} />
                                <span className="hidden lg:block text-sm font-bold transition-all">{item.label}</span>
                                {activeFeature === item.id && (
                                    <span className="hidden md:block lg:hidden absolute -left-0 w-1.5 h-8 bg-blue-600 dark:bg-blue-500 rounded-r-full shadow-[2px_0_12px_rgba(37,99,235,0.6)]"></span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="hidden md:flex flex-col items-center justify-start w-full mt-auto gap-2 lg:px-3 pb-4">
                        <button onClick={toggleTheme} className="flex flex-col lg:flex-row items-center justify-center lg:justify-start py-3 lg:px-4 text-gray-400 hover:text-blue-600 dark:hover:text-white rounded-2xl transition-all cursor-pointer w-full gap-3 hover:bg-gray-500/5 group relative">
                            {theme === 'light' ? <Moon className="w-7 lg:w-5 h-7 lg:h-5" /> : <Sun className="w-7 lg:w-5 h-7 lg:h-5" />}
                            <span className="hidden lg:block text-sm font-bold">Giao diện</span>
                        </button>

                        <button onClick={() => window.eel && window.eel.minimize_to_tray()} className="flex flex-col lg:flex-row items-center justify-center lg:justify-start py-3 lg:px-4 text-gray-400 hover:text-blue-600 dark:hover:text-white rounded-2xl transition-all cursor-pointer w-full gap-3 hover:bg-gray-500/5 group relative">
                            <Shrink className="w-7 lg:w-5 h-7 lg:h-5" />
                            <span className="hidden lg:block text-sm font-bold">Thu nhỏ</span>
                        </button>
                    </div>
                </div>
            </nav>
            )}

            <main className={`order-1 md:order-2 flex-1 relative overflow-y-auto overflow-x-visible flex flex-col no-scrollbar transition-all ${isMiniPlayer ? 'pt-0' : 'pt-2 md:pt-0'}`}>
                <div className={`flex-1 w-full ${isMiniPlayer ? 'p-0 h-full' : 'px-4 md:p-6 py-2'} min-h-0 flex flex-col`}>
                    {children}
                </div>
            </main>

            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                avatarSrc={avatarSrc}
                onAvatarUpdate={setAvatarSrc}
                onNameUpdate={setUserName}
            />
        </div>
    )
}
