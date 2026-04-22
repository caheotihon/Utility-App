import { useState } from 'react'
import Playlist from '../features/music/components/Playlist'
import Downloader from '../features/music/components/Downloader'

export default function Sidebar() {
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
    ">
      {/* Tabs Selector */}
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