import { useState } from 'react'
import Player from './components/Player'
import Playlist from './components/Playlist'
import Downloader from './components/Downloader'

function MusicSidebar() {
    const [tab, setTab] = useState('player')

    return (
        <aside className="
            relative z-20
            order-2 md:order-1
            shrink-0
            w-full md:w-[288px] lg:w-[340px] xl:w-[380px] xll:w-[400px]
            h-[500px] md:h-full
            bg-white dark:bg-gray-800
            md:rounded-3xl
            p-5 flex flex-col
            transition-all
            border border-black/5 dark:border-white/5
            shadow-[0_16px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.25)]
        ">
            <div className="flex gap-1 mb-6 shrink-0 bg-gray-100/50 dark:bg-gray-900/50 p-1.5 rounded-2xl">
                <button
                    onClick={() => setTab('player')}
                    className={`cursor-pointer flex-1 py-2.5 rounded-xl text-[13px] font-black transition-all ${tab === 'player'
                        ? 'bg-white dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white'
                        }`}
                >
                    Playlist
                </button>
                <button
                    onClick={() => setTab('downloader')}
                    className={`cursor-pointer flex-1 py-2.5 rounded-xl text-[13px] font-black transition-all ${tab === 'downloader'
                        ? 'bg-white dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white'
                        }`}
                >
                    Tải nhạc
                </button>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                {tab === 'player' ? <Playlist /> : <Downloader />}
            </div>
        </aside>
    )
}

export default function MusicPage() {
    return (
        <div className="
            flex flex-col md:flex-row 
            h-auto md:h-full w-full 
            gap-4 md:gap-6 
            transition-all duration-500 
            /* QUAN TRỌNG: Thay đổi overflow và thêm padding */
            overflow-y-visible md:overflow-visible 
            no-scrollbar 
            p-4 md:p-0 /* Thêm padding p-4 ở mobile để hiện bóng đổ */
        ">
            <MusicSidebar />
            <main className="flex-1 min-w-0 order-1 md:order-2 h-auto md:h-full flex flex-col relative z-10 overflow-visible">
                <div className="
                    flex-1 bg-white dark:bg-gray-900 
                    rounded-3xl 
                    border border-black/[0.03] dark:border-white/5 
                    /* Bóng đổ lớn cần không gian để lan tỏa */
                    shadow-[0_20px_50px_rgba(0,0,0,0.08)] 
                    dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] 
                    overflow-hidden
                ">
                    <Player />
                </div>
            </main>
        </div>
    )
}
