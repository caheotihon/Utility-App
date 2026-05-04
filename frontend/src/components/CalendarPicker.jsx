import { useState, useMemo, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

// Hoist ra ngoài component — không có closure, tạo đúng 1 lần
const parseDateStr = (str) => {
    if (!str) return null
    const parts = str.split(/[-/]/)
    if (parts.length !== 3) return null

    let d, m, y
    const p0 = parseInt(parts[0], 10)
    const p1 = parseInt(parts[1], 10)
    const p2 = parseInt(parts[2], 10)

    if (parts[0].length === 4) { // YYYY-MM-DD
        y = p0; m = p1; d = p2
    } else if (parts[2].length === 4) { // DD/MM/YYYY hoặc MM/DD/YYYY
        y = p2
        if (p0 > 12) { d = p0; m = p1 }      // Chắc chắn DD/MM
        else if (p1 > 12) { m = p0; d = p1 }  // Chắc chắn MM/DD
        else { d = p0; m = p1 }               // Mặc định DD/MM (VN)
    }
    return { y, m, d }
}

export default function CalendarPicker({ dates = [], activeDate, onSelectDate }) {
    const [isOpen, setIsOpen] = useState(false)

    // Lấy ngày hiện tại để hiển thị lịch ban đầu
    const [viewDate, setViewDate] = useState(new Date())

    // FIX LỖI: Chuẩn hóa dữ liệu ngày tháng để so sánh chính xác 100%
    const dateMap = useMemo(() => {
        const map = new Map()
        dates.forEach(originalDateStr => {
            const parsed = parseDateStr(originalDateStr)
            if (parsed) {
                map.set(`${parsed.y}-${parsed.m}-${parsed.d}`, originalDateStr)
            }
        })
        return map
    }, [dates])

    // Tự động nhảy lịch đến tháng của activeDate khi mở
    useEffect(() => {
        if (isOpen && activeDate) {
            const parsed = parseDateStr(activeDate)
            if (parsed) {
                setViewDate(new Date(parsed.y, parsed.m - 1, 1))
            }
        }
    }, [isOpen, activeDate])

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

    const changeMonth = (offset) => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1))
    }

    const changeYear = (offset) => {
        setViewDate(new Date(viewDate.getFullYear() + offset, viewDate.getMonth(), 1))
    }

    const renderDays = () => {
        const year = viewDate.getFullYear()
        const month = viewDate.getMonth()
        const days = []
        const totalDays = daysInMonth(year, month)
        const startDay = firstDayOfMonth(year, month)

        // Ô trống cho những ngày thuộc tháng trước
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8" />)
        }

        // Các ngày trong tháng
        for (let d = 1; d <= totalDays; d++) {
            const lookupKey = `${year}-${month + 1}-${d}`
            const matchedOriginalDate = dateMap.get(lookupKey) // Lấy chuỗi ngày gốc nếu có

            const hasData = !!matchedOriginalDate
            const isSelected = activeDate === matchedOriginalDate

            days.push(
                <button
                    key={d}
                    disabled={!hasData}
                    onClick={() => {
                        if (hasData) {
                            onSelectDate(matchedOriginalDate) // Gửi về đúng chuỗi gốc của ngày đó
                            setIsOpen(false)
                        }
                    }}
                    className={`h-8 w-8 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center relative
                        ${hasData ? 'cursor-pointer' : 'opacity-20 cursor-default'}
                        ${isSelected ? 'bg-emerald-500 text-white shadow-lg' : 'hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-gray-700 dark:text-gray-200'}
                    `}
                >
                    {d}
                    {hasData && !isSelected && (
                        <span className="absolute bottom-1 w-1 h-1 bg-emerald-500 rounded-full" />
                    )}
                </button>
            )
        }
        return days
    }

    return (
        <div className="relative shrink-0 flex items-center border-l border-gray-200 dark:border-white/10 pl-2 ml-1">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-full transition-all active:scale-95 cursor-pointer ${isOpen ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-white/5 text-gray-500 border border-gray-200 dark:border-transparent shadow-sm'
                    }`}
                title="Mở bộ chọn lịch"
            >
                <CalendarIcon className="w-4 h-4" />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 z-50 p-3 animate-in fade-in zoom-in-95 duration-200">

                        {/* Header: Chọn Tháng/Năm */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex gap-1">
                                <button onClick={() => changeYear(-1)} className="p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 rounded"><ChevronsLeft className="w-3 h-3" /></button>
                                <button onClick={() => changeMonth(-1)} className="p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 rounded"><ChevronLeft className="w-3 h-3" /></button>
                            </div>

                            <div className="text-xs font-black uppercase tracking-widest text-gray-800 dark:text-gray-100">
                                Tháng {viewDate.getMonth() + 1}, {viewDate.getFullYear()}
                            </div>

                            <div className="flex gap-1">
                                <button onClick={() => changeMonth(1)} className="p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 rounded"><ChevronRight className="w-3 h-3" /></button>
                                <button onClick={() => changeYear(1)} className="p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 rounded"><ChevronsRight className="w-3 h-3" /></button>
                            </div>
                        </div>

                        {/* Thứ trong tuần */}
                        <div className="grid grid-cols-7 mb-2">
                            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                                <div key={d} className="text-[9px] font-black text-gray-400 text-center uppercase">{d}</div>
                            ))}
                        </div>

                        {/* Grid Ngày */}
                        <div className="grid grid-cols-7 gap-1">
                            {renderDays()}
                        </div>

                        <div className="mt-3 pt-2 border-t border-gray-100 dark:border-white/5 flex justify-between items-center px-1">
                            <span className="text-[10px] text-gray-400 font-medium italic">* Ngày có chấm là có nhạc</span>
                            <button
                                onClick={() => setViewDate(new Date())}
                                className="text-[10px] font-bold text-emerald-500 hover:underline cursor-pointer p-1"
                            >
                                Về hiện tại
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}