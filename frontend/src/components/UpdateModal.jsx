import { DownloadCloud, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react'

export default function UpdateModal({ updateInfo, progress, isUpdating, onStartUpdate, onDismiss }) {
    if (!updateInfo) return null

    const renderProgressInfo = () => {
        if (!progress) return null

        let text = 'Đang xử lý...'
        let percent = progress.percent || 0

        switch (progress.status) {
            case 'downloading':
                text = `Đang tải xuống bản cập nhật... ${percent}%`
                break
            case 'extracting':
                text = 'Đang giải nén...'
                break
            case 'installing':
                text = 'Đang cài đặt...'
                break
            case 'ready_to_restart':
                text = 'Sẵn sàng khởi động lại...'
                break
            case 'error':
                text = `Lỗi: ${progress.error}`
                break
            default:
                break
        }

        return (
            <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span className="flex items-center gap-2">
                        {progress.status === 'error' ? (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                        ) : progress.status === 'ready_to_restart' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        )}
                        {text}
                    </span>
                </div>
                {progress.status !== 'error' && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                            style={{ width: `${percent}%` }}
                        ></div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-black/5 dark:border-white/10 p-6 animate-in zoom-in-95 fade-in">
                {!isUpdating && (
                    <button 
                        onClick={onDismiss}
                        className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}

                <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                        <DownloadCloud className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Cập nhật có sẵn</h2>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            v{updateInfo.current_version} ➔ v{updateInfo.latest_version}
                        </p>
                    </div>
                </div>

                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Chi tiết bản cập nhật:</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap max-h-32 overflow-y-auto scrollbar-custom pr-2">
                        {updateInfo.release_notes}
                    </div>
                </div>

                {isUpdating ? (
                    renderProgressInfo()
                ) : (
                    <div className="flex gap-3">
                        <button 
                            onClick={onDismiss}
                            className="flex-1 py-3 px-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                        >
                            Để sau
                        </button>
                        <button 
                            onClick={onStartUpdate}
                            className="flex-1 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/30"
                        >
                            Cập nhật ngay
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
