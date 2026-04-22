import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, User, Check, Edit2 } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose, avatarSrc, onAvatarUpdate }) {
    const fileInputRef = useRef(null);
    const [userName, setUserName] = useState(() => {
        return localStorage.getItem('user_name') || 'Tài Konn';
    });
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(userName);

    useEffect(() => {
        localStorage.setItem('user_name', userName);
    }, [userName]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => onAvatarUpdate(event.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSaveName = () => {
        if (tempName.trim()) {
            setUserName(tempName);
            setIsEditing(false);
        }
    };

    return (
        /* Container chính bao phủ toàn màn hình */
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">

            {/* Lớp Backdrop: Đảm bảo blur-xl hoạt động bằng cách giảm độ đậm của bg */}
            <div
                className="absolute inset-0 bg-white/10 dark:bg-black/40 backdrop-blur-2xl animate-in fade-in duration-500"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl dark:shadow-none animate-in zoom-in-95 duration-300">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all rounded-full hover:bg-gray-100 dark:hover:bg-white/5 z-10 cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-10 flex flex-col items-center">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-[0.1em]">
                        Hồ sơ cá nhân
                    </h2>

                    {/* Avatar Section */}
                    <div className="relative mb-10 group">
                        <div className="w-40 h-40 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden ring-4 ring-gray-100 dark:ring-white/5 transition-all shadow-inner">
                            {avatarSrc ? (
                                <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                            )}
                        </div>

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-1 right-1 p-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95 ring-4 ring-white dark:ring-gray-900 cursor-pointer"
                        >
                            <Camera className="w-5 h-5" />
                        </button>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />

                    {/* Info Field */}
                    <div className="w-full">
                        <div className="bg-gray-50 dark:bg-white/[0.02] p-6 rounded-[2rem] text-center border border-gray-100 dark:border-white/5">
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-[0.3em] block mb-2">
                                Display Name
                            </span>
                            <div className="flex items-center justify-center gap-2">
                                {isEditing ? (
                                    <div className="flex items-center gap-2 w-full">
                                        <input
                                            type="text"
                                            value={tempName}
                                            onChange={(e) => setTempName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                                            autoFocus
                                            className="text-xl text-gray-900 dark:text-emerald-400 font-bold bg-transparent border-b border-emerald-500 outline-none w-full text-center"
                                        />
                                        <button onClick={handleSaveName} className="text-emerald-500 hover:text-emerald-400">
                                            <Check className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-xl text-gray-900 dark:text-emerald-400 font-bold">
                                            {userName}
                                        </p>
                                        <button onClick={() => setIsEditing(true)} className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-white">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}