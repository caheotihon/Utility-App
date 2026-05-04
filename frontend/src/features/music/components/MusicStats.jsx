import { useMemo } from 'react'
import { useAudioPlayback } from '../../../context/AudioContext'
import { TrendingUp, Music, Crown, Flame, BarChart2 } from 'lucide-react'

// Hoạch định style theo rank — họi ra ngoài component để không tạo lại mỗi render
const RANK_STYLES = [
  'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 ring-2 ring-yellow-400/50 shadow-sm',
  'bg-gray-200 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 ring-1 ring-gray-400/50',
  'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 ring-1 ring-orange-400/50',
]
const getRankStyle = (index) => RANK_STYLES[index] ?? 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400'

export default function MusicStats() {
  const { playStats } = useAudioPlayback()

  // Sắp xếp và lấy Top 10 (chỉ tính lại khi playStats thay đổi)
  const { sortedStats, maxCount } = useMemo(() => {
    const sorted = Object.entries(playStats || {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
    const max = sorted.length > 0 ? sorted[0][1] : 1
    return { sortedStats: sorted, maxCount: max }
  }, [playStats])

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent">

      {/* HEADER TỔNG */}
      <div className="shrink-0 pt-2 pb-3 mb-2 border-b border-gray-100 dark:border-white/5 transition-colors">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 rounded-xl transition-colors">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-black uppercase tracking-wider text-gray-800 dark:text-gray-100 transition-colors">
              Bảng Xếp Hạng
            </h3>
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5 transition-colors">
              Top bài hát được nghe nhiều nhất
            </p>
          </div>
        </div>
      </div>

      {/* DANH SÁCH THỐNG KÊ */}
      <div className="flex-1 overflow-y-auto scrollbar-custom px-2 pb-10">
        {sortedStats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 opacity-60">
            <div className="relative w-20 h-20 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full mb-4 border border-gray-200 dark:border-white/5 transition-colors">
              <BarChart2 className="w-8 h-8 text-gray-400 dark:text-gray-500 absolute" />
              <div className="absolute inset-0 rounded-full border border-gray-300 dark:border-gray-600 border-dashed animate-[spin_10s_linear_infinite]" />
            </div>
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400 transition-colors">Chưa có dữ liệu</p>
            <p className="text-xs text-gray-500 mt-1">Hãy nghe thêm nhạc để tạo thống kê nhé.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 pt-2">
            {sortedStats.map(([title, count], index) => {
              const progressPercentage = (count / maxCount) * 100

              return (
                <div
                  key={title}
                  className="group relative flex items-center gap-3 p-2.5 rounded-2xl bg-gray-50/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-all shadow-sm hover:shadow-md animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* THANH TIẾN TRÌNH CHÌM (Background Progress) */}
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-indigo-50/50 dark:bg-indigo-500/10 transition-all duration-1000 ease-out -z-10 rounded-r-2xl"
                    style={{ width: `${progressPercentage}%` }}
                  />

                  {/* RANK BADGE */}
                  <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-full transition-colors ${getRankStyle(index)}`}>
                    {index === 0 ? (
                      <Crown className="w-4 h-4" />
                    ) : index === 1 || index === 2 ? (
                      <Flame className="w-4 h-4 opacity-80" />
                    ) : (
                      <span className="text-[11px] font-black">{index + 1}</span>
                    )}
                  </div>

                  {/* THÔNG TIN BÀI HÁT */}
                  <div className="flex-1 min-w-0 py-1">
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {title}
                    </h4>
                  </div>

                  {/* SỐ LƯỢT NGHE */}
                  <div className="shrink-0 flex flex-col items-end justify-center px-2">
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 leading-none">
                      {count}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                      Lượt nghe
                    </span>
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}