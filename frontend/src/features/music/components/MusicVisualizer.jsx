import React, { useMemo } from 'react'
import { Music } from 'lucide-react'

export default function MusicVisualizer({ className, cover, isPlaying, bassLevel, frequencies, theme }) {
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
    <div className={`relative flex items-center justify-center aspect-square ${className || ''}`}>
      {/* Audio Spectrum Bars */}
      <div 
        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
        style={{ transform: `scale(${1 + bassLevel * 0.05})` }}
      >
        {bars.map((val, i) => {
          const angle = (i * 360) / barsCount
          // Dynamic height relative to container size using %
          const heightPercent = 10 + (val / 255) * 20 
          return (
            <div
              key={i}
              className="absolute w-[3px] rounded-full origin-bottom transition-all duration-75"
              style={{
                height: `${heightPercent}%`,
                backgroundColor: val > 200 ? accentColor : '#ffffff',
                opacity: 0.4 + (val / 255) * 0.6,
                transform: `translateX(-50%) rotate(${angle}deg) translateY(-250%)`, // Push out relative to its height
                boxShadow: val > 180 ? `0 0 12px ${accentColor}` : 'none'
              }}
            />
          )
        })}
      </div>

      {/* Center Image (Disc) */}
      <div 
        className="relative z-10 w-full h-full rounded-full overflow-hidden shadow-2xl border-4 border-white/10 ring-4 ring-white dark:ring-gray-800 bg-gray-200 dark:bg-gray-800"
        style={{ 
          transform: `scale(${scale})`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0)_40%,rgba(0,0,0,0.3)_100%)]" />
        <div className="absolute inset-0 z-10 opacity-20 bg-[repeating-radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0px,rgba(255,255,255,0.1)_1px,transparent_1px,transparent_10px)] mix-blend-overlay" />

        {cover ? (
          <img 
            src={cover} 
            className={`w-full h-full object-cover transition-transform duration-1000 ${isPlaying ? 'animate-spin-slow' : 'pause-animation'}`}
            alt="Cover" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music className="w-1/3 h-1/3 text-gray-400 dark:text-gray-600" />
          </div>
        )}
        
        {/* Vinyl center hole effect */}
        <div className="absolute z-20 top-1/2 left-1/2 w-[8%] h-[8%] min-w-[12px] min-h-[12px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white dark:bg-gray-900 shadow-inner ring-4 ring-black/10" />
      </div>
    </div>
  )
}
