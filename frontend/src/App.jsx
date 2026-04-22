import React, { useState } from 'react'
import { AudioProvider } from './context/AudioContext'
import { NoteProvider } from './context/NoteContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/layout'
import MusicPage from './features/music/MusicPage'
import NotesPage from './features/notes/NotesPage'

function App() {
  const [activeFeature, setActiveFeature] = useState('music')

  return (
    <ThemeProvider>
      <AudioProvider>
        <NoteProvider>
          <Layout activeFeature={activeFeature} setActiveFeature={setActiveFeature}>
            {activeFeature === 'music' ? (
              <MusicPage />
            ) : (
              <NotesPage />
            )}
          </Layout>
        </NoteProvider>
      </AudioProvider>
    </ThemeProvider>
  )
}

export default App
