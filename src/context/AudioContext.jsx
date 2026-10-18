import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

const AudioContext = createContext(null);

const STORAGE_KEYS = {
  VOLUME: 'moodmix_volume',
  MUTED: 'moodmix_muted',
  SHUFFLE: 'moodmix_shuffle',
  REPEAT: 'moodmix_repeat',
  LAST_SONG: 'moodmix_last_song',
};

export function AudioProvider({ children }) {
  const audioRef = useRef(null);

  // Playback States
  const [currentSong, setCurrentSong] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LAST_SONG);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState(null);

  // Volume & Settings States (Persisted)
  const [volume, setVolumeState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VOLUME);
      return saved !== null ? parseFloat(saved) : 0.8;
    } catch {
      return 0.8;
    }
  });

  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.MUTED) === 'true';
    } catch {
      return false;
    }
  });

  const [isShuffle, setIsShuffle] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SHUFFLE) === 'true';
    } catch {
      return false;
    }
  });

  // Repeat modes: 'off' | 'all' | 'one'
  const [repeatMode, setRepeatMode] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.REPEAT) || 'off';
    } catch {
      return 'off';
    }
  });

  // Queue Management
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  
  // History Management (Recent tracks)
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('moodmix_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Global Toast Feedback
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  // Lắng nghe sự kiện bài hát bị Admin xóa để lập tức dọn dẹp khỏi lịch sử và hàng đợi
  useEffect(() => {
    const handleDeletedSongEvent = (e) => {
      const deletedId = e.detail?.songId;
      if (!deletedId) return;

      setHistory((prev) => {
        const cleaned = prev.filter((s) => s.id !== deletedId);
        try {
          localStorage.setItem('moodmix_history', JSON.stringify(cleaned));
        } catch {}
        return cleaned;
      });

      setQueue((prev) => prev.filter((s) => s.id !== deletedId));

      setCurrentSong((prev) => {
        if (prev?.id === deletedId) {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
          }
          setIsPlaying(false);
          try {
            localStorage.removeItem(STORAGE_KEYS.LAST_SONG);
          } catch {}
          return null;
        }
        return prev;
      });
      showToast('Bài hát vừa bị xóa khỏi hệ thống');
    };

    window.addEventListener('moodmix:song_deleted', handleDeletedSongEvent);
    return () => window.removeEventListener('moodmix:song_deleted', handleDeletedSongEvent);
  }, [showToast]);

  // Đồng bộ và quét sạch bài hát đã bị xóa khỏi cơ sở dữ liệu Supabase
  const validateAndPurgeDeletedSongs = useCallback((validSongs = []) => {
    if (!validSongs || validSongs.length === 0) return;
    const validIdSet = new Set(validSongs.map((s) => s.id));

    setHistory((prev) => {
      const cleaned = prev.filter((item) => validIdSet.has(item.id));
      if (cleaned.length !== prev.length) {
        try {
          localStorage.setItem('moodmix_history', JSON.stringify(cleaned));
        } catch (e) {
          console.warn('Failed to save cleaned history', e);
        }
      }
      return cleaned;
    });

    setQueue((prev) => prev.filter((item) => validIdSet.has(item.id)));

    setCurrentSong((prev) => {
      if (prev && !validIdSet.has(prev.id)) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }
        setIsPlaying(false);
        try {
          localStorage.removeItem(STORAGE_KEYS.LAST_SONG);
        } catch {}
        return null;
      }
      return prev;
    });
  }, []);

  // Synchronize audio volume & muted state with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Ensure audio element's src is always in sync with currentSong
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentSong?.audio_url) {
      if (audio.src !== currentSong.audio_url) {
        audio.src = currentSong.audio_url;
      }
    }
  }, [currentSong?.audio_url]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VOLUME, volume.toString());
      localStorage.setItem(STORAGE_KEYS.MUTED, isMuted.toString());
      localStorage.setItem(STORAGE_KEYS.SHUFFLE, isShuffle.toString());
      localStorage.setItem(STORAGE_KEYS.REPEAT, repeatMode);
      if (currentSong) {
        localStorage.setItem(STORAGE_KEYS.LAST_SONG, JSON.stringify(currentSong));
      }
    } catch (e) {
      console.warn('Could not save audio settings to localStorage', e);
    }
  }, [volume, isMuted, isShuffle, repeatMode, currentSong]);

  // Setup Media Session API for OS media controls, keyboard media keys, bluetooth headphones
  useEffect(() => {
    if ('mediaSession' in navigator && currentSong) {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: currentSong.title || 'MoodMix Audio',
        artist: currentSong.artist || 'Nghệ Sĩ MoodMix',
        album: currentSong.mood ? `MoodMix • ${currentSong.mood.toUpperCase()}` : 'MoodMix Stream',
        artwork: [
          {
            src: currentSong.cover_url || '/icon.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => resume());
      navigator.mediaSession.setActionHandler('pause', () => pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => playPrev());
      navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          seek(details.seekTime);
        }
      });
    }
  }, [currentSong]);

  // Play a specific song and optionally update the queue
  const playSong = useCallback((song, newQueue = null) => {
    if (!song || !song.audio_url) {
      console.warn('MoodMix: Song has no audio_url', song);
      return;
    }

    setPlaybackError(null);
    setCurrentSong(song);

    // Save to history (recent songs)
    setHistory((prev) => {
      const filtered = prev.filter((s) => s.id !== song.id);
      const updated = [song, ...filtered].slice(0, 30);
      try {
        localStorage.setItem('moodmix_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (newQueue && Array.isArray(newQueue) && newQueue.length > 0) {
      setQueue(newQueue);
      const idx = newQueue.findIndex((s) => s.id === song.id);
      setQueueIndex(idx !== -1 ? idx : 0);
    } else {
      setQueue((prev) => {
        const existingIdx = prev.findIndex((s) => s.id === song.id);
        if (existingIdx !== -1) {
          setQueueIndex(existingIdx);
          return prev;
        } else {
          const updated = [...prev, song];
          setQueueIndex(updated.length - 1);
          return updated;
        }
      });
    }

    const audio = audioRef.current;
    if (audio) {
      const crossfade = (() => {
        try {
          const s = localStorage.getItem('moodmix_settings');
          return s ? JSON.parse(s).crossfade || 0 : 0;
        } catch {
          return 0;
        }
      })();

      const targetVol = isMuted ? 0 : volume;

      // Smooth crossfade transition if enabled and already playing
      if (crossfade > 0 && isPlaying && audio.src && audio.src !== song.audio_url) {
        let fadeStep = 0;
        const fadeInterval = setInterval(() => {
          fadeStep++;
          if (audio) audio.volume = Math.max(0, targetVol * (1 - fadeStep / 8));
          if (fadeStep >= 8) {
            clearInterval(fadeInterval);
            audio.src = song.audio_url;
            setIsLoading(true);
            audio.play().then(() => {
              setIsPlaying(true);
              setIsLoading(false);
              let inStep = 0;
              const inInterval = setInterval(() => {
                inStep++;
                if (audio) audio.volume = Math.min(targetVol, (targetVol * inStep) / 8);
                if (inStep >= 8) clearInterval(inInterval);
              }, 30);
            }).catch((err) => {
              console.warn('Playback error during crossfade:', err);
              setIsPlaying(false);
              setIsLoading(false);
              if (audio) audio.volume = targetVol;
            });
          }
        }, 30);
        return;
      }

      if (audio.src !== song.audio_url) {
        audio.src = song.audio_url;
      }
      setIsLoading(true);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch((err) => {
            console.warn('Playback error or blocked by autoplay:', err);
            setIsPlaying(false);
            setIsLoading(false);
          });
      }
    }
  }, [isPlaying, isMuted, volume]);

  // Pause playback
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, []);

  // Resume playback
  const resume = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong?.audio_url) return;

    if (audio.src !== currentSong.audio_url) {
      audio.src = currentSong.audio_url;
    }

    setIsLoading(true);
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn('Resume failed:', err);
          setIsPlaying(false);
          setIsLoading(false);
        });
    }
  }, [currentSong]);

  // Toggle Play / Pause
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      if (currentSong?.audio_url) {
        resume();
      } else if (queue.length > 0) {
        playSong(queue[0], queue);
      }
    }
  }, [isPlaying, currentSong, queue, pause, resume, playSong]);

  // Next Track Logic
  const playNext = useCallback(() => {
    if (queue.length === 0) return;

    if (repeatMode === 'one' && currentSong) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      return;
    }

    if (isShuffle && queue.length > 1) {
      let randIdx = Math.floor(Math.random() * queue.length);
      if (randIdx === queueIndex) {
        randIdx = (randIdx + 1) % queue.length;
      }
      setQueueIndex(randIdx);
      playSong(queue[randIdx]);
      return;
    }

    const nextIdx = queueIndex + 1;
    if (nextIdx < queue.length) {
      setQueueIndex(nextIdx);
      playSong(queue[nextIdx]);
    } else if (repeatMode === 'all') {
      setQueueIndex(0);
      playSong(queue[0]);
    } else {
      pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
    }
  }, [queue, queueIndex, repeatMode, isShuffle, currentSong, playSong, pause]);

  // Previous Track Logic
  const playPrev = useCallback(() => {
    if (!audioRef.current) return;

    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    if (queue.length === 0) return;

    const prevIdx = queueIndex - 1;
    if (prevIdx >= 0) {
      setQueueIndex(prevIdx);
      playSong(queue[prevIdx]);
    } else if (repeatMode === 'all') {
      const lastIdx = queue.length - 1;
      setQueueIndex(lastIdx);
      playSong(queue[lastIdx]);
    } else {
      audioRef.current.currentTime = 0;
    }
  }, [queue, queueIndex, repeatMode, playSong]);

  // Seek position (seconds)
  const seek = useCallback((secs) => {
    if (audioRef.current && !isNaN(secs)) {
      audioRef.current.currentTime = secs;
      setCurrentTime(secs);
    }
  }, []);

  // Change volume (0.0 to 1.0)
  const changeVolume = useCallback((val) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (clamped === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  }, []);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.volume = next ? 0 : volume;
      }
      return next;
    });
  }, [volume]);

  // Toggle Shuffle
  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  // Cycle repeat: 'off' -> 'all' -> 'one' -> 'off'
  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  // Add song to queue (append to end)
  const addToQueue = useCallback((song) => {
    if (!song) return;
    if (!currentSong) {
      playSong(song, [song]);
      showToast(langVi => 'Đang phát bài hát này');
      return;
    }
    setQueue((prev) => {
      if (prev.some((s) => s.id === song.id)) {
        showToast('Bài hát đã có trong danh sách chờ');
        return prev;
      }
      showToast('Đã thêm bài hát vào danh sách phát');
      return [...prev, song];
    });
  }, [currentSong, playSong, showToast]);

  // Play next in queue (insert right after currently playing song)
  const playNextInQueue = useCallback((song) => {
    if (!song) return;
    if (!currentSong) {
      playSong(song, [song]);
      showToast('Đang phát bài hát này');
      return;
    }
    setQueue((prev) => {
      const filtered = prev.filter((s) => s.id !== song.id);
      const currIdx = filtered.findIndex((s) => s.id === currentSong.id);
      const insertIdx = currIdx !== -1 ? currIdx + 1 : filtered.length;
      filtered.splice(insertIdx, 0, song);
      showToast('Sẽ phát tiếp theo sau bài này');
      return [...filtered];
    });
  }, [currentSong, playSong, showToast]);

  // Reorder queue item (move up/down)
  const moveQueueItem = useCallback((fromIndex, toIndex) => {
    setQueue((prev) => {
      if (fromIndex < 0 || fromIndex >= prev.length || toIndex < 0 || toIndex >= prev.length) {
        return prev;
      }
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);

      if (currentSong) {
        const newIdx = copy.findIndex((s) => s.id === currentSong.id);
        if (newIdx !== -1) setQueueIndex(newIdx);
      }
      return copy;
    });
  }, [currentSong]);

  // Remove song from queue
  const removeFromQueue = useCallback((songId) => {
    setQueue((prev) => {
      const nextQueue = prev.filter((s) => s.id !== songId);
      if (currentSong) {
        const newIdx = nextQueue.findIndex((s) => s.id === currentSong.id);
        setQueueIndex(newIdx);
      }
      return nextQueue;
    });
    showToast('Đã xóa khỏi danh sách phát');
  }, [currentSong, showToast]);

  // Clear queue (keep current song)
  const clearQueue = useCallback(() => {
    setQueue(currentSong ? [currentSong] : []);
    setQueueIndex(currentSong ? 0 : -1);
    showToast('Đã xóa danh sách chờ');
  }, [currentSong, showToast]);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem('moodmix_history');
    } catch {}
    showToast('Đã xóa lịch sử nghe gần đây');
  }, [showToast]);

  // Handle HTML5 Audio Event Handlers
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio) {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
      setIsLoading(false);
    }
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const handleEnded = () => {
    // Check Autoplay Next setting from localStorage
    try {
      const saved = localStorage.getItem('moodmix_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.autoplayNext === false) {
          pause();
          return;
        }
      }
    } catch {}
    playNext();
  };

  const handleError = (e) => {
    console.error('Audio playback error:', e);
    setPlaybackError('Không thể phát file nhạc. Vui lòng kiểm tra lại link file âm thanh.');
    setIsPlaying(false);
    setIsLoading(false);

    // Tự động dọn dẹp bài hát hỏng hoặc đã bị xóa khỏi lịch sử nghe
    if (currentSong?.id) {
      const badId = currentSong.id;
      setHistory((prev) => {
        const cleaned = prev.filter((s) => s.id !== badId);
        try {
          localStorage.setItem('moodmix_history', JSON.stringify(cleaned));
        } catch {}
        return cleaned;
      });
      showToast('Bài hát không còn khả dụng hoặc đã bị gỡ bỏ.');
    }
  };

  const handleWaiting = () => {
    setIsLoading(true);
  };

  const handlePlaying = () => {
    setIsLoading(false);
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
    setIsLoading(false);
  };

  const value = {
    // States
    currentSong,
    isPlaying,
    currentTime,
    duration,
    progress: duration ? (currentTime / duration) * 100 : 0,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    queue,
    queueIndex,
    history,
    isLoading,
    playbackError,
    isQueueOpen,
    isLyricsOpen,
    toastMessage,

    // Actions
    playSong,
    togglePlay,
    pause,
    resume,
    playNext,
    playPrev,
    seek,
    changeVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    addToQueue,
    playNextInQueue,
    moveQueueItem,
    removeFromQueue,
    clearQueue,
    clearHistory,
    validateAndPurgeDeletedSongs,
    showToast,
    setQueue,
    setIsQueueOpen,
    setIsLyricsOpen,
    toggleQueue: () => setIsQueueOpen((prev) => !prev),
    toggleLyrics: () => setIsLyricsOpen((prev) => !prev),
  };

  return (
    <AudioContext.Provider value={value}>
      {/* 
        Single, Persistent HTML5 Audio Tag
        Lives at the root of the app, NEVER unmounts on tab switches or page navigations!
      */}
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onEnded={handleEnded}
        onError={handleError}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onPause={handlePause}
      />
      
      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="global-audio-toast">
          <span>{toastMessage}</span>
        </div>
      )}

      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
