import React, { useRef, useState, useEffect } from 'react'
import { Camera, X, User, Check, Edit2, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

const formatVersion = (version) => {
    if (!version) return '...'
    return `v${version}`
}

const renderUpdateProgress = (progress) => {
    if (!progress) return null

    let text = 'Đang xử lý...'
    const percent = progress.percent || 0

    switch (progress.status) {
        case 'downloading':
            text = `Đang tải xuống bản cập nhật... ${percent}%`
            break
        case 'extracting':
            text = 'Đang giải nén...'
            break
        case 'installing':
            text = 'Đang cài đặt...'
            break
        case 'ready_to_restart':
            text = 'Sẵn sàng khởi động lại...'
            break
        case 'error':
            text = `Lỗi: ${progress.error}`
            break
        default:
            break
    }

    return (
        <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                <span className="flex items-center gap-2">
                    {progress.status === 'error' ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : progress.status === 'ready_to_restart' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    )}
                    {text}
                </span>
            </div>
            {progress.status !== 'error' && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                    />
                </div>
            )}
        </div>
    )
}

export default function ProfileModal({
    isOpen,
    onClose,
    avatarSrc,
    currentVersion,
    updateInfo,
    progress,
    isUpdating,
    onStartUpdate,
    onDismissUpdate,
    onAvatarUpdate,
    onNameUpdate,
}) {
    const fileInputRef = useRef(null)
    const [userName, setUserName] = useState(() => {
        return localStorage.getItem('user_name') || 'Tài Konn'
    })
    const [isEditing, setIsEditing] = useState(false)
    const [tempName, setTempName] = useState(userName)

    useEffect(() => {
        localStorage.setItem('user_name', userName)
    }, [userName])

    if (!isOpen) return null

    const hasUpdate = Boolean(updateInfo?.has_update)

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => onAvatarUpdate(event.target.result)
            reader.readAsDataURL(file)
        }
    }

    const handleSaveName = () => {
        if (tempName.trim()) {
            setUserName(tempName)
            onNameUpdate?.(tempName)
            setIsEditing(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
            <div
                className="absolute inset-0 bg-white/10 dark:bg-black/40 backdrop-blur-2xl animate-in fade-in duration-500"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl dark:shadow-none animate-in zoom-in-95 duration-300">
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

                    <div className="w-full mt-4">
                        <div className="rounded-[2rem] border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] p-5 text-left">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 font-black">
                                        Phiên bản hiện tại
                                    </p>
                                    <p className="mt-2 text-lg font-black text-gray-900 dark:text-white">
                                        {formatVersion(currentVersion)}
                                    </p>
                                </div>

                                <span
                                    className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] ${
                                        hasUpdate
                                            ? 'bg-rose-500/10 text-rose-500 dark:text-rose-300'
                                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                                    }`}
                                >
                                    {hasUpdate ? 'Có bản mới' : 'Mới nhất'}
                                </span>
                            </div>

                            {hasUpdate && (
                                <div className="mt-4 rounded-[1.5rem] border border-amber-400/20 bg-amber-400/5 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                {formatVersion(updateInfo.current_version)} → {formatVersion(updateInfo.latest_version)}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                Có bản cập nhật mới, bấm cập nhật để tải và cài bản mới.
                                            </p>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-300">
                                            1
                                        </span>
                                    </div>

                                    {updateInfo.release_notes && (
                                        <div className="mt-3 max-h-28 overflow-y-auto rounded-2xl bg-white/60 dark:bg-black/20 p-3 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                            {updateInfo.release_notes}
                                        </div>
                                    )}

                                    {isUpdating ? (
                                        renderUpdateProgress(progress)
                                    ) : (
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={onDismissUpdate}
                                                className="flex-1 py-3 px-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                                            >
                                                Để sau
                                            </button>
                                            <button
                                                onClick={onStartUpdate}
                                                className="flex-1 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/30"
                                            >
                                                Cập nhật ngay
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {!hasUpdate && (
                                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                                    Bạn đang dùng phiên bản mới nhất.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
