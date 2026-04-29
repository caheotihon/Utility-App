import { useAudioPlayback } from '../../../context/AudioContext'
import { History, Calendar } from 'lucide-react'

export default function MusicHistory() {
  const { playHistory } = useAudioPlayback()

  const groupedHistory = (playHistory || []).reduce((acc, track) => {
    const date = track.date
    if (!acc[date]) acc[date] = []
    acc[date].push(track)
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto no-scrollbar pb-10">
      <div className="flex items-center gap-2 mb-2">
        <History className="w-5 h-5 text-emerald-500" />
        <h3 className="text-sm font-black uppercase tracking-wider text-gray-400">Timeline Nghe Nhạc</h3>
      </div>

      {Object.keys(groupedHistory).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-400 opacity-50">
          <Calendar className="w-10 h-10 mb-2" />
          <p className="text-xs font-bold">Lịch sử nghe nhạc đang trống</p>
        </div>
      ) : (
        Object.entries(groupedHistory).map(([date, tracks]) => (
          <div key={date} className="flex flex-col gap-3">
            <div className="sticky top-0 z-10 py-1 bg-white dark:bg-gray-800">
              <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400">
                {date}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {tracks.map((track, i) => (
                <div key={`${track.timestamp}-${i}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-black text-indigo-500">
                      {new Date(track.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold truncate dark:text-gray-200">{track.title}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{track.artist}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
