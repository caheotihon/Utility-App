import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Content - Đồng bộ màu nền #212121 và viền giống BottomPlayer */}
            <div className="relative bg-white dark:bg-[#212121] border border-black/5 dark:border-white/5 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                        {/* Icon Box - Chuyển sang tone màu Emerald */}
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <AlertCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                {title || 'Xác nhận hành động'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 break-words">
                                {message || 'Bạn có chắc chắn muốn thực hiện hành động này?'}
                            </p>
                        </div>
                    </div>

                    {/* Nút bấm */}
                    <div className="flex gap-3 mt-6">
                        {/* Nút Hủy */}
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-medium transition-colors cursor-pointer select-none"
                        >
                            Hủy
                        </button>
                        
                        {/* Nút Xác nhận - Chuyển sang màu Emerald thương hiệu */}
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors cursor-pointer select-none"
                        >
                            Xác nhận
                        </button>
                    </div>
                </div>

                {/* Nút Close X góc trên phải */}
                <button
                    onClick={onClose}
                    className="cursor-pointer absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}