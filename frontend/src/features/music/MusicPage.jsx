import { useState, useEffect } from 'react'
import Player from './components/Player'
import Playlist from './components/Playlist'
import Downloader from './components/Downloader'
import FocusMode from './components/FocusMode'
import { ListMusic, Download, Brain } from 'lucide-react'
import { useAudioPlayback } from '../../context/AudioContext'

function MusicSidebar() {
    const [tab, setTab] = useState(() => localStorage.getItem('musicActiveTab') || 'player')
    const { isMiniPlayer } = useAudioPlayback()

    useEffect(() => {
        localStorage.setItem('musicActiveTab', tab)
    }, [tab])

    if (isMiniPlayer) return null

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
            <div className="flex gap-1 mb-4 shrink-0 bg-gray-100/50 dark:bg-gray-900/50 p-1 rounded-xl">
                {[
                    { id: 'player', icon: ListMusic, color: 'emerald' },
                    { id: 'downloader', icon: Download, color: 'indigo' },
                    { id: 'focus', icon: Brain, color: 'purple' }
                ].map(item => {
                    const activeStyles = {
                        emerald: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
                        indigo: 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
                        purple: 'bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400',
                        rose: 'bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
                    }
                    
                    return (
                        <button
                            key={item.id}
                            onClick={() => setTab(item.id)}
                            className={`cursor-pointer flex-1 py-2 rounded-lg flex items-center justify-center transition-all ${tab === item.id
                                ? `${activeStyles[item.color]} shadow-sm`
                                : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <item.icon className="w-4 h-4" />
                        </button>
                    )
                })}
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                {tab === 'player' && <Playlist />}
                {tab === 'downloader' && <Downloader />}
                {tab === 'focus' && <FocusMode />}
            </div>
        </aside>
    )
}

export default function MusicPage() {
    const { isMiniPlayer } = useAudioPlayback()

    return (
        <div className={`
            flex flex-col md:flex-row 
            h-auto md:h-full w-full 
            ${isMiniPlayer ? 'gap-0' : 'gap-4 md:gap-6'} 
            transition-all duration-500 
            overflow-y-visible md:overflow-visible 
            no-scrollbar 
            ${isMiniPlayer ? 'p-0' : 'p-4 md:p-0'}
        `}>
            <MusicSidebar />
            <main className={`flex-1 min-w-0 order-1 md:order-2 h-auto md:h-full flex flex-col relative z-10 overflow-visible ${isMiniPlayer ? 'p-0' : ''}`}>
                <div className={`
                    flex-1 bg-white dark:bg-gray-900 
                    ${isMiniPlayer ? 'rounded-none border-none' : 'rounded-3xl border border-black/[0.03] dark:border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)]'}
                    overflow-hidden
                `}>
                    <Player />
                </div>
            </main>
        </div>
    )
}



