import React from 'react';

export default function Avatar({ src, size = 'w-12 h-12', onClick, fallback = 'U' }) {
    return (
        <div
            onClick={onClick}
            className={`${size} cursor-pointer rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-2 ring-white/10 dark:ring-white/10 hover:ring-blue-500/50 transition-all cursor-pointer overflow-hidden shrink-0`}
        >
            {src ? (
                <img src={src} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
                <span className="text-xl font-black text-white italic">{fallback}</span>
            )}
        </div>
    );
}