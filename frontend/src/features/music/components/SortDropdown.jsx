/**
 * SortDropdown — dropdown selector for sorting the song library.
 */

import { useState, useRef, useEffect } from 'react'
import { ArrowUpDown, ChevronDown } from 'lucide-react'

const SORT_OPTIONS = [
    { id: 'newest', label: 'Mới nhất' },
    { id: 'oldest', label: 'Cũ nhất' },
    { id: 'title_asc', label: 'Tên A→Z' },
    { id: 'title_desc', label: 'Tên Z→A' },
    { id: 'artist', label: 'Nghệ sĩ' },
    { id: 'duration', label: 'Độ dài' },
]

export default function SortDropdown({ value, onChange }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    const selected = SORT_OPTIONS.find(o => o.id === value) || SORT_OPTIONS[0]

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(v => !v)}
                title="Sắp xếp"
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-[12px] font-semibold transition-all"
            >
                <ArrowUpDown className="w-4 h-4" />
                <span className="hidden sm:inline">{selected.label}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-black/5 dark:border-white/10 py-1 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
                    {SORT_OPTIONS.map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => { onChange(opt.id); setOpen(false) }}
                            className={`w-full text-left px-4 py-2 text-[13px] font-medium transition-colors ${value === opt.id
                                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
