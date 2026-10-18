import React, { useEffect, useRef } from 'react';
import { PlayCircle, PlusCircle, ListPlus, Copy, Heart, Check, Sparkles } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

export default function SongActionMenu({
  song,
  isOpen,
  onClose,
  position = { top: 0, left: 0 },
  onOpenAddToPlaylist,
  isFavorite,
  onToggleFavorite,
  lang = 'vi'
}) {
  const menuRef = useRef(null);
  const { playNextInQueue, addToQueue, showToast } = useAudio();

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleScroll = () => {
      onClose();
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !song) return null;

  const handlePlayNext = () => {
    playNextInQueue(song);
    onClose();
  };

  const handleAddToQueue = () => {
    addToQueue(song);
    onClose();
  };

  const handleAddToPlaylist = () => {
    onClose();
    onOpenAddToPlaylist?.(song);
  };

  const handleCopyLink = () => {
    if (song.audio_url && navigator.clipboard) {
      navigator.clipboard.writeText(song.audio_url);
      showToast(lang === 'vi' ? 'Đã sao chép liên kết bài hát!' : 'Song link copied!');
    }
    onClose();
  };

  // Adjust position so it doesn't overflow screen
  const menuStyle = {
    top: `${Math.min(position.top, window.innerHeight - 240)}px`,
    left: `${Math.min(position.left, window.innerWidth - 240)}px`,
  };

  return (
    <div 
      ref={menuRef} 
      className="song-action-popover glass-card animate-fadeInScale"
      style={menuStyle}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Song Header Preview */}
      <div className="action-menu-song-header">
        <div className="action-menu-thumb">
          {song.cover_url ? (
            <img src={song.cover_url} alt={song.title} />
          ) : (
            <div className="action-menu-placeholder" />
          )}
        </div>
        <div className="action-menu-meta">
          <span className="action-menu-title">{song.title}</span>
          <span className="action-menu-artist">{song.artist}</span>
        </div>
      </div>

      <div className="action-menu-divider" />

      {/* Action Options */}
      <div className="action-menu-list">
        <button
          type="button"
          className="action-menu-item"
          onClick={handlePlayNext}
        >
          <PlayCircle size={16} className="text-purple" />
          <span>{lang === 'vi' ? 'Phát tiếp theo' : 'Play next'}</span>
        </button>

        <button
          type="button"
          className="action-menu-item"
          onClick={handleAddToQueue}
        >
          <PlusCircle size={16} className="text-cyan" />
          <span>{lang === 'vi' ? 'Thêm vào danh sách phát' : 'Add to queue'}</span>
        </button>

        <button
          type="button"
          className="action-menu-item"
          onClick={handleAddToPlaylist}
        >
          <ListPlus size={16} className="text-green" />
          <span>{lang === 'vi' ? 'Thêm vào playlist...' : 'Add to playlist...'}</span>
        </button>

        {onToggleFavorite && (
          <button
            type="button"
            className="action-menu-item"
            onClick={() => {
              onToggleFavorite(song.id);
              onClose();
            }}
          >
            <Heart size={16} className={isFavorite ? 'text-red fill-red' : 'text-muted'} />
            <span>
              {isFavorite 
                ? (lang === 'vi' ? 'Xóa khỏi yêu thích' : 'Remove from favorites') 
                : (lang === 'vi' ? 'Thêm vào yêu thích' : 'Add to favorites')}
            </span>
          </button>
        )}

        <button
          type="button"
          className="action-menu-item"
          onClick={handleCopyLink}
        >
          <Copy size={16} className="text-muted" />
          <span>{lang === 'vi' ? 'Sao chép liên kết' : 'Copy audio link'}</span>
        </button>
      </div>
    </div>
  );
}
