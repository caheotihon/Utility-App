/**
 * PlaylistContext — manages user-created playlists.
 * Persists via Python backend (playlist_manager.py → AppData/playlists/).
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const PlaylistContext = createContext(null)

export function PlaylistProvider({ children }) {
    const [playlists, setPlaylists] = useState([])
    const [activePlaylistId, setActivePlaylistId] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const fetchPlaylists = useCallback(() => {
        if (!window.eel) return
        setIsLoading(true)
        window.eel.get_all_playlists()((data) => {
            if (Array.isArray(data)) setPlaylists(data)
            setIsLoading(false)
        })
    }, [])

    useEffect(() => {
        if (window.eel) {
            fetchPlaylists()
            return
        }

        const handleEelReady = () => fetchPlaylists()
        window.addEventListener('eelReady', handleEelReady, { once: true })
        return () => window.removeEventListener('eelReady', handleEelReady)
    }, [fetchPlaylists])

    const createPlaylist = useCallback((name) => {
        if (!window.eel) return
        window.eel.create_playlist(name)((pl) => {
            if (pl) {
                setPlaylists(prev => [...prev, pl])
            }
        })
    }, [])

    const deletePlaylist = useCallback((id) => {
        if (!window.eel) return
        window.eel.delete_playlist(id)((ok) => {
            if (ok) {
                setPlaylists(prev => prev.filter(p => p.id !== id))
                if (activePlaylistId === id) setActivePlaylistId(null)
            }
        })
    }, [activePlaylistId])

    const renamePlaylist = useCallback((id, newName) => {
        if (!window.eel) return
        window.eel.rename_playlist(id, newName)((ok) => {
            if (ok) {
                setPlaylists(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p))
            }
        })
    }, [])

    const addSongToPlaylist = useCallback((playlistId, filename) => {
        if (!window.eel) return
        window.eel.add_song_to_playlist(playlistId, filename)((ok) => {
            if (ok) fetchPlaylists()
        })
    }, [fetchPlaylists])

    const removeSongFromPlaylist = useCallback((playlistId, filename) => {
        if (!window.eel) return
        window.eel.remove_song_from_playlist(playlistId, filename)((ok) => {
            if (ok) fetchPlaylists()
        })
    }, [fetchPlaylists])

    return (
        <PlaylistContext.Provider value={{
            playlists,
            activePlaylistId,
            setActivePlaylistId,
            isLoading,
            fetchPlaylists,
            createPlaylist,
            deletePlaylist,
            renamePlaylist,
            addSongToPlaylist,
            removeSongFromPlaylist,
        }}>
            {children}
        </PlaylistContext.Provider>
    )
}

export const usePlaylists = () => useContext(PlaylistContext)
