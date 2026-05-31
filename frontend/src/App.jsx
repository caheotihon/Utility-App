import { useState } from 'react'
import { AudioProvider } from './context/AudioContext'
import { ThemeProvider } from './context/ThemeContext'
import { PlaylistProvider } from './context/PlaylistContext'
import Layout from './components/layout'
import MusicPage from './features/music/MusicPage'
import UpdateModal from './components/UpdateModal'
import { useAutoUpdate } from './hooks/useAutoUpdate'

function App() {
  const { updateInfo, progress, isUpdating, startUpdate, dismissUpdate } = useAutoUpdate()
  const [activeTab, setActiveTab] = useState('home')

  return (
    <ThemeProvider>
      <AudioProvider>
        <PlaylistProvider>
          <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
            <MusicPage activeTab={activeTab} setActiveTab={setActiveTab} />
          </Layout>

          
          <UpdateModal
            updateInfo={updateInfo}
            progress={progress}
            isUpdating={isUpdating}
            onStartUpdate={startUpdate}
            onDismiss={dismissUpdate}
          />
        </PlaylistProvider>
      </AudioProvider>
    </ThemeProvider>
  )
}

export default App
