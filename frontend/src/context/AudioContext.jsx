import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'

const AudioContext = createContext()

export function AudioProvider({ children }) {
  const [playlist, setPlaylist] = useState([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.9)
  const [isMuted, setIsMuted] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [repeatMode, setRepeatMode] = useState('off') // 'off' | 'one'
  const [originalPlaylist, setOriginalPlaylist] = useState([]) // Lưu lại thứ tự gốc
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('music_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [isOnlyFavorites, setIsOnlyFavorites] = useState(false); // Trạng thái lọc yêu thích toàn cục
  const [downloadStatus, setDownloadStatus] = useState('')

  const audioRef = useRef(new Audio())
  const loadedTrackKeyRef = useRef(null)

  // Refs để truy cập state mới nhất bên trong Event Listeners mà không cần re-bind listener
  const stateRef = useRef({
    playlist: [],
    currentTrackIndex: -1,
    isOnlyFavorites: false,
    favorites: [],
    isShuffle: false,
    repeatMode: 'off'
  })

  // Đồng bộ Refs khi state thay đổi
  useEffect(() => {
    stateRef.current = { playlist, currentTrackIndex, isOnlyFavorites, favorites, isShuffle, repeatMode }
  }, [playlist, currentTrackIndex, isOnlyFavorites, favorites, isShuffle, repeatMode])

  // Đồng bộ favorites với localStorage
  useEffect(() => {
    localStorage.setItem('music_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const refreshPlaylist = useCallback(() => {
    if (window.eel) {
      window.eel.get_playlist()((data) => {
        if (data && Array.isArray(data)) {
          setPlaylist(data)
          setOriginalPlaylist([...data]) // Lưu lại bản gốc khi mới tải
          if (data.length > 0 && stateRef.current.currentTrackIndex === -1) {
            setCurrentTrackIndex(0)
          }
        }
      })
    }
  }, [])

  useEffect(() => {
    refreshPlaylist()
  }, [refreshPlaylist])

  useEffect(() => {
    const handleStatusEvent = (event) => {
      const msg = event.detail;
      console.log("[Eel Context] Nhận trạng thái:", msg);
      setDownloadStatus(msg);
      
      if (msg.includes('✅') || msg.toLowerCase().includes('hoàn tất')) {
        refreshPlaylist();
      }
    };

    window.addEventListener('eelDownloadStatus', handleStatusEvent);
    return () => window.removeEventListener('eelDownloadStatus', handleStatusEvent);
  }, [refreshPlaylist]);

  // Logic Chuyển bài
  const handleNext = useCallback(() => {
    const { playlist, currentTrackIndex, isOnlyFavorites, favorites } = stateRef.current
    if (playlist.length === 0) return

    // Lọc danh sách bài hát hợp lệ theo chế độ hiện tại
    const effectivePlaylist = isOnlyFavorites 
      ? playlist.filter(track => favorites.includes(track.file))
      : playlist;

    if (effectivePlaylist.length === 0) return;

    // Tìm index hiện tại trong danh sách hiệu dụng
    const currentTrack = playlist[currentTrackIndex];
    let currentIndexInEffective = effectivePlaylist.findIndex(t => t.file === currentTrack?.file);

    // Tính toán bài tiếp theo trong danh sách hiệu dụng
    const nextInEffective = (currentIndexInEffective + 1) % effectivePlaylist.length;
    const nextTrack = effectivePlaylist[nextInEffective];

    // Cập nhật lại index trong danh sách gốc
    const nextIndexInOriginal = playlist.findIndex(t => t.file === nextTrack.file);
    setCurrentTrackIndex(nextIndexInOriginal);
    setIsPlaying(true);
  }, [])

  const handlePrev = useCallback(() => {
    const { playlist, currentTrackIndex, isOnlyFavorites, favorites } = stateRef.current
    if (playlist.length === 0) return

    const effectivePlaylist = isOnlyFavorites 
      ? playlist.filter(track => favorites.includes(track.file))
      : playlist;

    if (effectivePlaylist.length === 0) return;

    const currentTrack = playlist[currentTrackIndex];
    let currentIndexInEffective = effectivePlaylist.findIndex(t => t.file === currentTrack?.file);

    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0
      return
    }

    const prevInEffective = currentIndexInEffective <= 0 ? effectivePlaylist.length - 1 : currentIndexInEffective - 1;
    const prevTrack = effectivePlaylist[prevInEffective];

    const prevIndexInOriginal = playlist.findIndex(t => t.file === prevTrack.file);
    setCurrentTrackIndex(prevIndexInOriginal);
    setIsPlaying(true);
  }, [])

  const handleEnded = useCallback(() => {
    const { repeatMode } = stateRef.current
    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0
      setCurrentTime(0)
      audioRef.current.play().catch(() => { })
      return
    }
    handleNext()
  }, [handleNext])

  // ỔN ĐỊNH EVENT LISTENERS: Chỉ gán 1 lần, dùng Ref để đọc mode
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
      audio.play().catch(() => { })
    } else {
      audio.pause()
    }
  }, [isPlaying, currentTrackIndex])

  const togglePlay = useCallback(() => {
    if (currentTrackIndex === -1 && playlist.length > 0) {
      setCurrentTrackIndex(0)
      setIsPlaying(true)
    } else {
      setIsPlaying(prev => !prev)
    }
  }, [currentTrackIndex, playlist])

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

  // HÀM TRỘN NHẠC THỰC THỤ (Fisher-Yates Shuffle)
  const toggleShuffle = useCallback(() => {
    if (isShuffle) {
      // Đang Shuffle -> Tắt: Khôi phục danh sách gốc
      const currentTrack = playlist[currentTrackIndex];
      setPlaylist([...originalPlaylist]);
      setIsShuffle(false);
      // Tìm lại index mới trong list gốc để không bị nhảy bài
      if (currentTrack) {
        const newIndex = originalPlaylist.findIndex(t => t.file === currentTrack.file);
        if (newIndex !== -1) setCurrentTrackIndex(newIndex);
      }
    } else {
      // Đang Normal -> Bật: Trộn danh sách, đưa bài đang nghe lên đầu (không reset time)
      const currentTrack = playlist[currentTrackIndex] || null;

      const fisherYates = (arr) => {
        const out = [...arr];
        for (let i = out.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [out[i], out[j]] = [out[j], out[i]];
        }
        return out;
      };

      if (currentTrack) {
        const remaining = playlist.filter(t => t.file !== currentTrack.file);
        const shuffled = [currentTrack, ...fisherYates(remaining)];
        setPlaylist(shuffled);
        setCurrentTrackIndex(0);
      } else {
        setPlaylist(fisherYates(playlist));
      }
      setIsShuffle(true);
    }
  }, [isShuffle, playlist, currentTrackIndex, originalPlaylist]);

  const toggleFavorite = useCallback((trackId) => {
    setFavorites(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId) 
        : [...prev, trackId]
    );
  }, []);

  const deleteTrack = useCallback((filename) => {
    if (window.eel) {
      window.eel.delete_song(filename)((success) => {
        if (success) {
          // Nếu bài bị xoá là bài đang phát, thì dừng nhạc trước
          const currentTrack = stateRef.current.playlist[stateRef.current.currentTrackIndex];
          if (currentTrack && currentTrack.file === filename) {
            audioRef.current.pause();
            audioRef.current.src = "";
            loadedTrackKeyRef.current = null;
            setIsPlaying(false);
            setCurrentTrackIndex(-1);
          }
          refreshPlaylist();
        }
      });
    }
  }, [refreshPlaylist]);

  return (
    <AudioContext.Provider value={{
      playlist, setPlaylist, refreshPlaylist,
      currentTrackIndex, setCurrentTrackIndex,
      currentTrack: playlist[currentTrackIndex] || null,
      isPlaying, setIsPlaying, togglePlay, playTrack,
      currentTime, duration, seek,
      volume, setVolume,
      isMuted, setIsMuted,
      isShuffle, toggleShuffle,
      repeatMode, toggleRepeat,
      favorites, toggleFavorite,
      deleteTrack,
      isOnlyFavorites, setIsOnlyFavorites,
      handleNext, handlePrev,
      downloadStatus, setDownloadStatus
    }}>
      {children}
    </AudioContext.Provider>
  )
}

export const useAudio = () => useContext(AudioContext)
