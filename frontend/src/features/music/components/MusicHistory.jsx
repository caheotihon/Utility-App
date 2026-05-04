import { useState, useEffect, useMemo } from 'react'
import { useAudioPlayback } from '../../../context/AudioContext'
import { History, Clock, PlayCircle, Music } from 'lucide-react'

export default function MusicHistory() {
  const { playHistory } = useAudioPlayback()

  // Xử lý dữ liệu: Nhóm theo ngày và CHỈ LẤY 10 NGÀY GẦN NHẤT
  const { groupedHistory, dates } = useMemo(() => {
    const grouped = (playHistory || []).reduce((acc, track) => {
      const date = track.date
      if (!acc[date]) acc[date] = []
      acc[date].push(track)
      return acc
    }, {})

    // Sắp xếp các ngày từ MỚI NHẤT -> CŨ NHẤT để thanh trượt luôn hiển thị ngày gần đây lên đầu
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      const [d1, m1, y1] = a.split('/')
      const [d2, m2, y2] = b.split('/')
      return new Date(`${y2}-${m2}-${d2}`) - new Date(`${y1}-${m1}-${d1}`)
    })

    // CHỐT HẠ: Chỉ lấy đúng 10 ngày đầu tiên (10 ngày gần nhất)
    const recent10Dates = sortedDates.slice(0, 10)

    return { groupedHistory: grouped, dates: recent10Dates }
  }, [playHistory])

  const [activeDate, setActiveDate] = useState(dates[0] || null)

  // Cập nhật activeDate nếu có dữ liệu mới
  useEffect(() => {
    if (dates.length > 0 && !dates.includes(activeDate)) {
      setActiveDate(dates[0])
    }
  }, [dates, activeDate])

  const activeTracks = activeDate ? groupedHistory[activeDate] : []

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent relative">
      {/* HEADER TỔNG */}
      <div className="shrink-0 pt-2 pb-3 mb-2 border-b border-gray-100 dark:border-white/5 transition-colors">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl transition-colors">
            <History className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-black uppercase tracking-wider text-gray-800 dark:text-gray-100 transition-colors">
              Lịch sử phát nhạc
            </h3>
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5 transition-colors">
              10 ngày gần nhất
            </p>
          </div>
        </div>
      </div>

      {/* TRẠNG THÁI TRỐNG */}
      {dates.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center opacity-60">
          <div className="relative w-20 h-20 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full mb-4 border border-gray-200 dark:border-white/5 transition-colors">
            <History className="w-8 h-8 text-gray-400 dark:text-gray-500 absolute" />
            <div className="absolute inset-0 rounded-full border border-gray-300 dark:border-gray-600 border-dashed animate-[spin_10s_linear_infinite]" />
          </div>
          <p className="text-sm font-bold text-gray-600 dark:text-gray-400 transition-colors">Chưa có lịch sử</p>
          <p className="text-xs text-gray-500 mt-1">Các bài hát bạn nghe sẽ xuất hiện ở đây.</p>
        </div>
      ) : (
        <>
          {/* SLIDER CHỌN NGÀY (Cái trượt trượt) */}
          <div className="shrink-0 flex items-center px-2 pb-4 border-b border-transparent">
            <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-custom scroll-smooth snap-x pb-2">
              {dates.map((date) => (
                <button
                  key={date}
                  onClick={() => setActiveDate(date)}
                  className={`cursor-pointer shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all snap-start shadow-sm
                    ${activeDate === date
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                      : 'bg-white dark:bg-white/5 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-transparent'
                    }
                  `}
                >
                  {date}
                </button>
              ))}
            </div>
          </div>

          {/* DANH SÁCH BÀI HÁT */}
          <div className="flex-1 overflow-y-auto scrollbar-custom px-2 pb-10 mt-2">
            <div className="relative ml-4 border-l-2 border-dashed border-gray-200 dark:border-white/10 space-y-4 pb-6 transition-colors">
              {activeTracks.map((track, i) => (
                <div key={`${track.timestamp}-${i}`} className="relative pl-6 group animate-in fade-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${i * 30}ms` }}>

                  {/* Dấu chấm Timeline */}
                  <div className="absolute -left-[5px] top-4 w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-emerald-500 dark:group-hover:bg-emerald-400 transition-colors ring-4 ring-white dark:ring-[#0b0e14] group-hover:ring-emerald-100 dark:group-hover:ring-emerald-400/20" />

                  {/* Card Bài hát */}
                  <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-gray-50/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all cursor-pointer shadow-sm hover:shadow-md group-hover:-translate-y-0.5">

                    <div className="flex flex-col items-center justify-center min-w-[3.5rem]">
                      <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 mb-1 transition-colors" />
                      <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {new Date(track.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="w-px h-8 bg-gray-200 dark:bg-white/10 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/30 transition-colors" />

                    <div className="flex flex-col min-w-0 flex-1 py-1">
                      <span className="text-sm font-bold truncate text-gray-800 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                        {track.title}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Music className="w-3 h-3 text-gray-400 dark:text-gray-500 shrink-0" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {track.artist || 'Unknown Artist'}
                        </span>
                      </div>
                    </div>

                    <div className="pr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      <PlayCircle className="w-7 h-7 text-emerald-500 dark:text-emerald-400 drop-shadow-sm dark:drop-shadow-md" />
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}