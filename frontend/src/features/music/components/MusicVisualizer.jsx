import React, { useMemo } from 'react'
import { Music } from 'lucide-react'

export default function MusicVisualizer({ cover, isPlaying, bassLevel, frequencies, theme }) {
  const accentColor = theme === 'dark' ? '#10b981' : '#6366f1'

  const barsCount = 100
  const bars = useMemo(() => {
    if (!frequencies || frequencies.length === 0) return Array(barsCount).fill(0)
    const data = []
    const step = Math.floor(frequencies.length / barsCount) || 1
    for (let i = 0; i < barsCount; i++) {
      data.push(frequencies[i * step] || 0)
    }
    return data
  }, [frequencies])

  // Scale based on bass
  const scale = 1 + (bassLevel * 0.1)

  return (
    <div className="relative flex items-center justify-center w-full aspect-square max-w-[320px] mb-6">
      {/* Audio Spectrum Bars */}
      <div 
        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
        style={{ transform: `scale(${1 + bassLevel * 0.05})` }}
      >
        {bars.map((val, i) => {
          const angle = (i * 360) / barsCount
          const height = 10 + (val / 255) * 60
          return (
            <div
              key={i}
              className="absolute w-[3px] rounded-full origin-bottom transition-all duration-75"
              style={{
                height: `${height}px`,
                backgroundColor: val > 200 ? accentColor : '#ffffff',
                opacity: 0.4 + (val / 255) * 0.6,
                transform: `translateX(-50%) rotate(${angle}deg) translateY(-145px)`,
                boxShadow: val > 180 ? `0 0 12px ${accentColor}` : 'none'
              }}
            />
          )
        })}
      </div>

      {/* Center Image (Disc) */}
      <div 
        className="relative z-10 w-full h-full rounded-full overflow-hidden shadow-2xl border-4 border-white/10"
        style={{ 
          transform: `scale(${scale}) rotate(${isPlaying ? '0deg' : '0deg'})`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        {cover ? (
          <img 
            src={cover} 
            className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
            alt="Cover" 
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <Music className="w-20 h-20 text-gray-600" />
          </div>
        )}
        
        {/* Vinyl center hole effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-900 rounded-full border-2 border-white/20 shadow-inner" />
      </div>
    </div>
  )
}
