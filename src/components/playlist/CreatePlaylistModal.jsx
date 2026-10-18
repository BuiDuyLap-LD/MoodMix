import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createPlaylist } from '../../services/musicService';

export default function CreatePlaylistModal({
  isOpen,
  onClose,
  onPlaylistCreated,
  user,
  onOpenLogin,
  lang = 'vi'
}) {
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isShuffle, setIsShuffle] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (!user) {
      onClose();
      onOpenLogin?.();
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const newPlaylist = await createPlaylist({
        title: title.trim(),
        userId: user.id,
        isPublic,
        isShuffle,
        description: `Tạo bởi ${user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}`
      });

      setTitle('');
      setIsPublic(true);
      setIsShuffle(true);
      onPlaylistCreated?.(newPlaylist);
      onClose();
    } catch (err) {
      console.error('Error creating playlist:', err);
      setErrorMsg(err.message || 'Không thể tạo playlist. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="playlist-modal-backdrop" onClick={onClose}>
      <div 
        className="playlist-modal-card" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="playlist-modal-header">
          <h3 className="playlist-modal-title">
            {lang === 'vi' ? 'Tạo playlist mới' : 'Create new playlist'}
          </h3>
          <button 
            type="button" 
            className="playlist-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="playlist-modal-form">
          {errorMsg && (
            <div className="playlist-error-banner">
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Name Input */}
          <div className="playlist-input-wrap">
            <input
              type="text"
              className="playlist-name-input"
              placeholder={lang === 'vi' ? 'Nhập tên playlist' : 'Enter playlist name'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              maxLength={60}
            />
          </div>

          {/* Toggle 1: Công khai */}
          <div className="playlist-setting-row">
            <div className="setting-info">
              <span className="setting-title">
                {lang === 'vi' ? 'Công khai' : 'Public'}
              </span>
              <span className="setting-desc">
                {lang === 'vi' 
                  ? 'Mọi người có thể nhìn thấy playlist này' 
                  : 'Anyone can see and listen to this playlist'}
              </span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          {/* Toggle 2: Phát ngẫu nhiên */}
          <div className="playlist-setting-row">
            <div className="setting-info">
              <span className="setting-title">
                {lang === 'vi' ? 'Phát ngẫu nhiên' : 'Shuffle'}
              </span>
              <span className="setting-desc">
                {lang === 'vi' 
                  ? 'Luôn phát ngẫu nhiên tất cả bài hát' 
                  : 'Always shuffle songs in this playlist'}
              </span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={isShuffle}
                onChange={(e) => setIsShuffle(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="playlist-submit-btn"
            disabled={!title.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <span>{lang === 'vi' ? 'TẠO MỚI' : 'CREATE'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
