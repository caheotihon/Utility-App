import { useMemo } from 'react'
import MainPlayerView from './components/MainPlayerView'
import QueuePanel from './components/QueuePanel'
import LibraryView from './components/LibraryView'
import { useAudioPlayback } from '../../context/AudioContext'
import Downloader from './components/Downloader'

export default function MusicPage({ activeTab }) {
    const { currentTrack } = useAudioPlayback()

    // Nếu không có bài hát đang phát và tab là now_playing, tự động chuyển về home (logic này có thể để sau)
    
    return (
        <div className="w-full h-full flex overflow-hidden">
            {activeTab === 'now_playing' ? (
                <>
                    {/* Main Content (Left of the right panel) */}
                    <div className="flex-1 min-w-0 flex flex-col p-4 sm:p-8">
                        <MainPlayerView />
                    </div>

                    {/* Right Column (Queue Panel) */}
                    <QueuePanel />
                </>
            ) : activeTab === 'downloader' ? (
                <div className="flex-1 p-6 overflow-y-auto max-w-4xl mx-auto">
                    <Downloader />
                </div>
            ) : (
                <div className="flex-1 p-6 overflow-y-auto">
                    <LibraryView activeTab={activeTab} />
                </div>
            )}
        </div>
    )
}
