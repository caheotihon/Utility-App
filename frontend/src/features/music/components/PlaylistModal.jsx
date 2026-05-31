/**
 * PlaylistModal — Create / Rename playlist dialog
 */

import { useState, useEffect, useRef } from 'react'
import { X, ListMusic } from 'lucide-react'

export default function PlaylistModal({ isOpen, onClose, onConfirm, initialName = '', title = 'Tạo playlist mới' }) {
    const [name, setName] = useState(initialName)
    const inputRef = useRef(null)

    useEffect(() => {
        if (isOpen) {
            setName(initialName)
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [isOpen, initialName])

    if (!isOpen) return null

    const handleSubmit = (e) => {
        e.preventDefault()
        const trimmed = name.trim()
        if (!trimmed) return
        onConfirm(trimmed)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/55 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-white dark:bg-[#121212] rounded-3xl shadow-2xl border border-black/5 dark:border-white/10 p-5 sm:p-6 animate-in zoom-in-95 fade-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                        <ListMusic className="w-5 h-5 text-emerald-500" />
                    </div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        ref={inputRef}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Tên playlist..."
                        maxLength={60}
                        className="w-full px-4 py-3 rounded-2xl bg-gray-100 dark:bg-[#1a1a1a] border-none text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                    />
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-[#1a1a1a] text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                        >
                            Huỷ
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold text-white transition-all"
                        >
                            Xác nhận
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
