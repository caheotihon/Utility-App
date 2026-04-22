import { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react'

const AudioPlaybackContext = createContext(null)
const AudioLibraryContext = createContext(null)
const AudioDownloadContext = createContext(null)
const AudioActionsContext = createContext(null)

export function AudioProvider({ children }) {
  const [playlist, setPlaylist] = useState([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.9)
  const [isMuted, setIsMuted] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [repeatMode, setRepeatMode] = useState('off')
  const [originalPlaylist, setOriginalPlaylist] = useState([])
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('music_favorites')
    return saved ? JSON.parse(saved) : []
  })
  const [isOnlyFavorites, setIsOnlyFavorites] = useState(false)
  const [downloadStatus, setDownloadStatus] = useState('')

  const audioRef = useRef(new Audio())
  const loadedTrackKeyRef = useRef(null)

  const stateRef = useRef({
    playlist: [],
    currentTrackIndex: -1,
    isOnlyFavorites: false,
    favorites: [],
    isShuffle: false,
    repeatMode: 'off',
    originalPlaylist: [],
  })

  useEffect(() => {
    stateRef.current = {
      playlist,
      currentTrackIndex,
      isOnlyFavorites,
      favorites,
      isShuffle,
      repeatMode,
      originalPlaylist,
    }
  }, [playlist, currentTrackIndex, isOnlyFavorites, favorites, isShuffle, repeatMode, originalPlaylist])

  useEffect(() => {
    localStorage.setItem('music_favorites', JSON.stringify(favorites))
  }, [favorites])

  const refreshPlaylist = useCallback(() => {
    if (!window.eel) return

    window.eel.get_playlist()((data) => {
      if (Array.isArray(data)) {
        setPlaylist(data)
        setOriginalPlaylist([...data])
        if (data.length > 0 && stateRef.current.currentTrackIndex === -1) {
          setCurrentTrackIndex(0)
        }
      }
    })
  }, [])

  useEffect(() => {
    refreshPlaylist()
  }, [refreshPlaylist])

  useEffect(() => {
    const handleStatusEvent = (event) => {
      const msg = event.detail || ''
      setDownloadStatus(msg)

      const lower = msg.toLowerCase()
      if (msg.includes('✅') || lower.includes('hoàn tất')) {
        refreshPlaylist()
      }
    }

    window.addEventListener('eelDownloadStatus', handleStatusEvent)
    return () => window.removeEventListener('eelDownloadStatus', handleStatusEvent)
  }, [refreshPlaylist])

  const handleNext = useCallback(() => {
    const { playlist, currentTrackIndex, isOnlyFavorites, favorites } = stateRef.current
    if (playlist.length === 0) return

    const effectivePlaylist = isOnlyFavorites
      ? playlist.filter(track => favorites.includes(track.file))
      : playlist

    if (effectivePlaylist.length === 0) return

    const currentTrack = playlist[currentTrackIndex]
    const currentIndexInEffective = effectivePlaylist.findIndex(t => t.file === currentTrack?.file)
    const nextInEffective = (currentIndexInEffective + 1) % effectivePlaylist.length
    const nextTrack = effectivePlaylist[nextInEffective]
    const nextIndexInOriginal = playlist.findIndex(t => t.file === nextTrack.file)

    setCurrentTrackIndex(nextIndexInOriginal)
    setIsPlaying(true)
  }, [])

  const handlePrev = useCallback(() => {
    const { playlist, currentTrackIndex, isOnlyFavorites, favorites } = stateRef.current
    if (playlist.length === 0) return

    const effectivePlaylist = isOnlyFavorites
      ? playlist.filter(track => favorites.includes(track.file))
      : playlist

    if (effectivePlaylist.length === 0) return

    const currentTrack = playlist[currentTrackIndex]
    const currentIndexInEffective = effectivePlaylist.findIndex(t => t.file === currentTrack?.file)

    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0
      return
    }

    const prevInEffective = currentIndexInEffective <= 0 ? effectivePlaylist.length - 1 : currentIndexInEffective - 1
    const prevTrack = effectivePlaylist[prevInEffective]
    const prevIndexInOriginal = playlist.findIndex(t => t.file === prevTrack.file)

    setCurrentTrackIndex(prevIndexInOriginal)
    setIsPlaying(true)
  }, [])

  const handleEnded = useCallback(() => {
    const { repeatMode } = stateRef.current
    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0
      setCurrentTime(0)
      audioRef.current.play().catch(() => {})
      return
    }
    handleNext()
  }, [handleNext])

  useEffect(() => {
    const audio = audioRef.current

    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onLoadedMetadata = () => setDuration(audio.duration)
    const onEnded = () => handleEnded()

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
    }
  }, [handleEnded])

  useEffect(() => {
    audioRef.current.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  useEffect(() => {
    const track = currentTrackIndex >= 0 ? playlist[currentTrackIndex] : null
    if (!track) return

    const trackKey = `${track.file || ''}|${track.url || ''}`
    if (loadedTrackKeyRef.current === trackKey && audioRef.current.src) return

    loadedTrackKeyRef.current = trackKey
    audioRef.current.src = track.url
    audioRef.current.load()
    setCurrentTime(0)
    setDuration(0)
  }, [currentTrackIndex, playlist])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio.src) return

    if (isPlaying) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [isPlaying, currentTrackIndex])

  const togglePlay = useCallback(() => {
    const { currentTrackIndex, playlist } = stateRef.current
    if (currentTrackIndex === -1 && playlist.length > 0) {
      setCurrentTrackIndex(0)
      setIsPlaying(true)
      return
    }

    setIsPlaying(prev => !prev)
  }, [])

  const playTrack = useCallback((index) => {
    setCurrentTrackIndex(index)
    setIsPlaying(true)
  }, [])

  const seek = useCallback((time) => {
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }, [])

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => (prev === 'one' ? 'off' : 'one'))
  }, [])

  const toggleShuffle = useCallback(() => {
    const { isShuffle, playlist, currentTrackIndex, originalPlaylist } = stateRef.current

    if (isShuffle) {
      const currentTrack = playlist[currentTrackIndex]
      setPlaylist([...originalPlaylist])
      setIsShuffle(false)

      if (currentTrack) {
        const newIndex = originalPlaylist.findIndex(t => t.file === currentTrack.file)
        if (newIndex !== -1) setCurrentTrackIndex(newIndex)
      }
      return
    }

    const currentTrack = playlist[currentTrackIndex] || null

    const fisherYates = (arr) => {
      const out = [...arr]
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[out[i], out[j]] = [out[j], out[i]]
      }
      return out
    }

    if (currentTrack) {
      const remaining = playlist.filter(t => t.file !== currentTrack.file)
      const shuffled = [currentTrack, ...fisherYates(remaining)]
      setPlaylist(shuffled)
      setCurrentTrackIndex(0)
    } else {
      setPlaylist(fisherYates(playlist))
    }

    setIsShuffle(true)
  }, [])

  const toggleFavorite = useCallback((trackId) => {
    setFavorites(prev =>
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    )
  }, [])

  const deleteTrack = useCallback((filename) => {
    if (!window.eel) return

    window.eel.delete_song(filename)((success) => {
      if (!success) return

      const currentTrack = stateRef.current.playlist[stateRef.current.currentTrackIndex]
      if (currentTrack && currentTrack.file === filename) {
        audioRef.current.pause()
        audioRef.current.src = ''
        loadedTrackKeyRef.current = null
        setIsPlaying(false)
        setCurrentTrackIndex(-1)
      }
      refreshPlaylist()
    })
  }, [refreshPlaylist])

  const currentTrack = currentTrackIndex >= 0 ? playlist[currentTrackIndex] || null : null

  const playbackValue = useMemo(() => ({
    currentTrack,
    currentTrackIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
  }), [currentTrack, currentTrackIndex, isPlaying, currentTime, duration, volume, isMuted, isShuffle, repeatMode])

  const libraryValue = useMemo(() => ({
    playlist,
    favorites,
    isOnlyFavorites,
    currentTrackIndex,
  }), [playlist, favorites, isOnlyFavorites, currentTrackIndex])

  const downloadValue = useMemo(() => ({
    downloadStatus,
    setDownloadStatus,
    refreshPlaylist,
  }), [downloadStatus, refreshPlaylist])

  const actionsValue = useMemo(() => ({
    setPlaylist,
    setCurrentTrackIndex,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setVolume,
    setIsMuted,
    setIsShuffle,
    setRepeatMode,
    setFavorites,
    setIsOnlyFavorites,
    togglePlay,
    playTrack,
    seek,
    toggleRepeat,
    toggleShuffle,
    toggleFavorite,
    deleteTrack,
    handleNext,
    handlePrev,
  }), [
    togglePlay,
    playTrack,
    seek,
    toggleRepeat,
    toggleShuffle,
    toggleFavorite,
    deleteTrack,
    handleNext,
    handlePrev,
  ])

  return (
    <AudioPlaybackContext.Provider value={playbackValue}>
      <AudioLibraryContext.Provider value={libraryValue}>
        <AudioDownloadContext.Provider value={downloadValue}>
          <AudioActionsContext.Provider value={actionsValue}>
            {children}
          </AudioActionsContext.Provider>
        </AudioDownloadContext.Provider>
      </AudioLibraryContext.Provider>
    </AudioPlaybackContext.Provider>
  )
}

export const useAudioPlayback = () => useContext(AudioPlaybackContext)
export const useAudioLibrary = () => useContext(AudioLibraryContext)
export const useAudioDownload = () => useContext(AudioDownloadContext)
export const useAudioActions = () => useContext(AudioActionsContext)

export const useAudio = () => ({
  ...(useAudioPlayback() || {}),
  ...(useAudioLibrary() || {}),
  ...(useAudioDownload() || {}),
  ...(useAudioActions() || {}),
})
