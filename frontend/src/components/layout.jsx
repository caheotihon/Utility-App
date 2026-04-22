import React, { useState, useEffect } from 'react'
import { Music, FileText, Sun, Moon, Shrink } from 'lucide-react'
import Avatar from './Avatar'
import ProfileModal from './ProfileModal'
import { useTheme } from '../context/ThemeContext'

export default function Layout({ children, activeFeature, setActiveFeature }) {
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

    useEffect(() => {
        if (!isProfileOpen) {
            setUserName(localStorage.getItem('user_name') || 'Tài Konn');
        }
    }, [isProfileOpen]);

    const navItems = [
        { id: 'music', icon: Music, label: 'Âm nhạc' },
        { id: 'notes', icon: FileText, label: 'Ghi chú' },
    ]

    return (
        <div className="h-screen w-full bg-gray-50 dark:bg-[#0b0e14] text-gray-900 dark:text-gray-100 flex flex-col md:flex-row overflow-hidden font-sans transition-colors duration-300 md:gap-0 gap-3">

            {/* Navigation */}
            <nav className="order-2 md:order-1 w-full md:w-24 lg:w-64 bg-white/90 dark:bg-gray-900/50 backdrop-blur-xl border-t md:border-t-0 md:border-r border-black/5 dark:border-white/10 z-50 shrink-0 pb-[env(safe-area-inset-bottom)]">
                <div className="flex flex-row md:flex-col items-center justify-around md:justify-start h-16 md:h-full py-0 md:py-8 px-2 md:px-0 gap-0 md:gap-6 lg:gap-8">

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

                    <div className="flex flex-row md:flex-col items-center justify-around md:justify-start flex-[2] md:flex-none md:w-full gap-0 md:gap-4 lg:px-3">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveFeature(item.id)}
                                className={`flex flex-col lg:flex-row items-center justify-center lg:justify-start py-1 md:p-3 lg:px-4 rounded-2xl transition-all relative group cursor-pointer flex-1 md:flex-none min-w-0 md:min-w-[64px] lg:w-full gap-3 ${activeFeature === item.id
                                    ? 'text-blue-600 dark:text-blue-400 bg-blue-500/5 lg:bg-blue-500/10'
                                    : 'text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-white hover:bg-gray-500/5'
                                    }`}
                            >
                                <div className="p-1 lg:p-0 rounded-xl transition-all">
                                    <item.icon className={`w-6 h-6 md:w-7 md:h-7 lg:w-5 lg:h-5 transition-all duration-300 ${activeFeature === item.id ? 'scale-110' : ''}`} />
                                </div>

                                {/* Label: Chỉ hiện chữ thật sự ở màn hình lớn (lg), mobile/tablet dùng tooltip */}
                                <span className="hidden lg:block text-sm font-bold transition-all">
                                    {item.label}
                                </span>

                                {/* Tooltip cho Tablet (Ẩn khi ở màn hình lg vì đã có chữ) */}
                                <span className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 lg:group-hover:opacity-0 transition-opacity whitespace-nowrap z-[60] pointer-events-none shadow-xl border border-white/10">
                                    {item.label}
                                </span>

                                {activeFeature === item.id && (
                                    <span className="hidden md:block lg:hidden absolute -left-0 w-1.5 h-8 bg-blue-600 dark:bg-blue-500 rounded-r-full shadow-[2px_0_12px_rgba(37,99,235,0.6)]"></span>
                                )}
                                {activeFeature === item.id && (
                                    <span className="md:hidden absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-500 rounded-full"></span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Nút Theme & Minimize */}
                    <div className="flex flex-row md:flex-col items-center justify-around md:justify-start flex-[2] md:flex-none md:w-full mt-0 md:mt-auto gap-0 md:gap-2 lg:px-3">
                        <button
                            onClick={toggleTheme}
                            className="flex flex-col lg:flex-row items-center justify-center lg:justify-start py-1 md:p-3 lg:px-4 text-gray-400 hover:text-blue-600 dark:hover:text-white rounded-2xl transition-all cursor-pointer flex-1 md:flex-none min-w-0 md:min-w-[64px] lg:w-full gap-3 hover:bg-gray-500/5 group relative"
                        >
                            <div className="p-1 lg:p-0">
                                {theme === 'light' ? <Moon className="w-6 h-6 md:w-7 md:h-7 lg:w-5 lg:h-5" /> : <Sun className="w-6 h-6 md:w-7 md:h-7 lg:w-5 lg:h-5" />}
                            </div>
                            <span className="hidden lg:block text-sm font-bold">Giao diện</span>
                            <span className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 lg:group-hover:opacity-0 transition-opacity whitespace-nowrap z-[60] pointer-events-none shadow-xl border border-white/10">
                                Đổi giao diện
                            </span>
                        </button>

                        <button
                            onClick={() => window.eel && window.eel.minimize_to_tray()}
                            className="flex flex-col lg:flex-row items-center justify-center lg:justify-start py-1 md:p-3 lg:px-4 text-gray-400 hover:text-blue-600 dark:hover:text-white rounded-2xl transition-all cursor-pointer flex-1 md:flex-none min-w-0 md:min-w-[64px] lg:w-full gap-3 hover:bg-gray-500/5 group relative"
                        >
                            <div className="p-1 lg:p-0">
                                <Shrink className="w-6 h-6 md:w-7 md:h-7 lg:w-5 lg:h-5" />
                            </div>
                            <span className="hidden lg:block text-sm font-bold">Thu nhỏ</span>
                            <span className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 lg:group-hover:opacity-0 transition-opacity whitespace-nowrap z-[60] pointer-events-none shadow-xl border border-white/10">
                                Thu nhỏ ứng dụng
                            </span>
                        </button>
                    </div>

                    {/* Avatar cho Mobile */}
                    <button onClick={() => setIsProfileOpen(true)} className="md:hidden flex flex-col items-center justify-center py-1 flex-1 min-w-0 md:min-w-[64px]">
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-black/10 dark:border-white/20">
                            {avatarSrc ? <img src={avatarSrc} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-300 dark:bg-gray-700" />}
                        </div>
                    </button>
                </div>
            </nav>

            <main className="order-1 md:order-2 flex-1 relative overflow-y-auto overflow-x-visible flex flex-col no-scrollbar transition-all pt-2 md:pt-0">
                <div className="flex-1 w-full px-4 md:p-6 py-2 min-h-0 flex flex-col">
                    {children}
                </div>
            </main>

            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                avatarSrc={avatarSrc}
                onAvatarUpdate={setAvatarSrc}
            />
        </div>
    )
}
