import React from 'react'
import Sidebar from '../../components/Sidebar'
import Player from './components/Player'

export default function MusicPage() {
    return (
        <div className="flex flex-col md:flex-row h-auto md:h-full w-full gap-4 md:gap-2 lg:gap-4 xl:gap-6 transition-all duration-500 overflow-y-auto md:overflow-hidden no-scrollbar">

            {/* Gọi trực tiếp Sidebar, không cần bọc thẻ aside thừa nữa */}
            <Sidebar />

            {/* Main Player Section */}
            <main className="flex-1 min-w-0 order-1 md:order-2 h-auto md:h-full flex flex-col relative z-10">
                <div className="flex-1 bg-white dark:bg-gray-900 rounded-3xl border border-black/[0.03] dark:border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden">
                    <Player />
                </div>
            </main>

        </div>
    )
}