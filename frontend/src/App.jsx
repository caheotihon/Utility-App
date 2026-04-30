import { useState, useEffect } from 'react'
import { AudioProvider } from './context/AudioContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/layout'
import MusicPage from './features/music/MusicPage'
import MusicStats from './features/music/components/MusicStats'
import MusicHistory from './features/music/components/MusicHistory'

function App() {
  const [activeFeature, setActiveFeature] = useState(() => localStorage.getItem('activeFeature') || 'music')

  useEffect(() => {
    localStorage.setItem('activeFeature', activeFeature)
  }, [activeFeature])

  return (
    <ThemeProvider>
      <AudioProvider>
        <Layout activeFeature={activeFeature} setActiveFeature={setActiveFeature}>
          {activeFeature === 'music' && <MusicPage />}
          {activeFeature === 'stats' && <MusicStats />}
          {activeFeature === 'history' && <MusicHistory />}
        </Layout>
      </AudioProvider>
    </ThemeProvider>
  )
}

export default App
