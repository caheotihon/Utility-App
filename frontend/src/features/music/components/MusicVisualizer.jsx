import React, { useMemo } from 'react'
import { Music } from 'lucide-react'

export default function MusicVisualizer({ className, cover, isPlaying, bassLevel, frequencies, theme }) {
  const accentColor = theme === 'dark' ? '#10b981' : '#6366f1'

  const barsCount = 80 // Giảm số lượng cột sóng từ 100 xuống 80 trên thiết bị nhỏ để đỡ rối mắt
  const bars = useMemo(() => {
    if (!frequencies || frequencies.length === 0) return Array(barsCount).fill(0)
    const data = []
    const step = Math.floor(frequencies.length / barsCount) || 1
    for (let i = 0; i < barsCount; i++) {
      data.push(frequencies[i * step] || 0)
    }
    return data
  }, [frequencies])

  const scale = 1 + (bassLevel * 0.04)

  return (
    <div className={`relative flex items-center justify-center aspect-square ${className || ''}`}>
      {/* Audio Spectrum Bars */}
      <div 
        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
        style={{ transform: `scale(${1 + bassLevel * 0.02})` }}
      >
        {bars.map((val, i) => {
          const angle = (i * 360) / barsCount
          const heightPercent = 6 + (val / 255) * 16 // Giới hạn chiều dài cột sóng vừa phải
          return (
            <div
              key={i}
              className="absolute w-[2px] sm:w-[2.5px] rounded-full origin-bottom transition-all duration-75"
              style={{
                height: `${heightPercent}%`,
                backgroundColor: val > 190 ? accentColor : theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)',
                opacity: 0.4 + (val / 255) * 0.6,
                transform: `translateX(-50%) rotate(${angle}deg) translateY(-270%)`,
                boxShadow: val > 190 ? `0 0 6px ${accentColor}` : 'none'
              }}
            />
          )
        })}
      </div>

      {/* Center Image (Đĩa nhạc tròn) */}
      <div 
        className="relative z-10 w-[72%] h-[72%] rounded-full overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.4)] border-2 sm:border-4 border-black/20 ring-2 sm:ring-4 ring-white/5 bg-gray-900"
        style={{ 
          transform: `scale(${scale})`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_50%,rgba(0,0,0,0.5)_100%)]" />
        <div className="absolute inset-0 z-10 opacity-25 bg-[repeating-radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0px,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_8px)] mix-blend-overlay" />

        {cover ? (
          <img 
            src={cover} 
            className="w-full h-full object-cover" 
            style={{
              animation: 'spin 25s linear infinite',
              animationPlayState: isPlaying ? 'running' : 'paused'
            }}
            alt="Cover" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <Music className="w-1/3 h-1/3 text-gray-500" />
          </div>
        )}
        
        {/* Tâm lỗ đĩa */}
        <div className="absolute z-20 top-1/2 left-1/2 w-[6%] h-[6%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#111111] border border-white/15 shadow-inner" />
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}