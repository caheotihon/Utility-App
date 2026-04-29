import { useAudioPlayback } from '../../../context/AudioContext'
import { TrendingUp, Clock, Music } from 'lucide-react'

export default function MusicStats() {
  const { playStats } = useAudioPlayback()
  
  const sortedStats = Object.entries(playStats || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto no-scrollbar pb-10">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-5 h-5 text-indigo-500" />
        <h3 className="text-sm font-black uppercase tracking-wider text-gray-400">Top Bài Hát</h3>
      </div>
      
      {sortedStats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-400 opacity-50">
          <Music className="w-10 h-10 mb-2" />
          <p className="text-xs font-bold">Chưa có dữ liệu thống kê</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sortedStats.map(([title, count], index) => (
            <div key={title} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-black/[0.03] dark:border-white/5">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="text-xs font-black text-indigo-500 w-4">#{index + 1}</span>
                <span className="text-xs font-bold truncate dark:text-gray-200">{title}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <span className="text-xs font-black text-gray-900 dark:text-white">{count}</span>
                <span className="text-[10px] font-bold text-gray-400">lượt</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
