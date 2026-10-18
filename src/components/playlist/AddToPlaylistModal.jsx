import React, { useState } from 'react';
import { X, Check, ListMusic, Plus, Loader2 } from 'lucide-react';
import { addSongToPlaylist } from '../../services/musicService';

export default function AddToPlaylistModal({
  isOpen,
  onClose,
  song,
  playlists = [],
  user,
  onOpenCreatePlaylist,
  lang = 'vi'
}) {
  const [addingId, setAddingId] = useState(null);
  const [successId, setSuccessId] = useState(null);

  if (!isOpen || !song) return null;

  // Only user's own playlists
  const myPlaylists = playlists.filter((pl) => user && pl.user_id === user.id);

  const handleAddToPlaylist = async (playlistId) => {
    setAddingId(playlistId);
    const res = await addSongToPlaylist(playlistId, song.id);
    setAddingId(null);

    if (res.success) {
      setSuccessId(playlistId);
      setTimeout(() => {
        setSuccessId(null);
        onClose();
      }, 1200);
    } else {
      alert(lang === 'vi' ? 'Bài hát đã có trong playlist này!' : 'Song already in playlist!');
    }
  };

  return (
    <div className="playlist-modal-backdrop" onClick={onClose}>
      <div 
        className="playlist-modal-card add-to-playlist-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="playlist-modal-header">
          <div className="add-modal-title-box">
            <ListMusic size={18} className="text-purple" />
            <h3 className="playlist-modal-title">
              {lang === 'vi' ? 'Thêm vào Playlist' : 'Add to Playlist'}
            </h3>
          </div>
          <button type="button" className="playlist-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="add-modal-song-info">
          <div className="add-song-thumb">
            {song.cover_url ? (
              <img src={song.cover_url} alt={song.title} />
            ) : (
              <ListMusic size={18} />
            )}
          </div>
          <div className="add-song-meta">
            <span className="add-song-title">{song.title}</span>
            <span className="add-song-artist">{song.artist}</span>
          </div>
        </div>

        <div className="add-modal-playlists-list">
          {myPlaylists.length === 0 ? (
            <div className="add-modal-empty">
              <p>
                {lang === 'vi' 
                  ? 'Bạn chưa có playlist cá nhân nào.' 
                  : 'You do not have any playlists yet.'}
              </p>
              <button
                type="button"
                className="btn-create-first-pl"
                onClick={() => {
                  onClose();
                  onOpenCreatePlaylist();
                }}
              >
                <Plus size={16} />
                <span>{lang === 'vi' ? 'Tạo playlist mới ngay' : 'Create new playlist'}</span>
              </button>
            </div>
          ) : (
            myPlaylists.map((pl) => {
              const isAdding = addingId === pl.id;
              const isSuccess = successId === pl.id;

              return (
                <div
                  key={pl.id}
                  className="add-pl-item"
                  onClick={() => handleAddToPlaylist(pl.id)}
                >
                  <div className="add-pl-meta">
                    <span className="add-pl-title">{pl.title}</span>
                    <span className="add-pl-count">
                      {pl.is_public ? (lang === 'vi' ? 'Công khai' : 'Public') : (lang === 'vi' ? 'Riêng tư' : 'Private')}
                    </span>
                  </div>

                  <div className="add-pl-action">
                    {isAdding ? (
                      <Loader2 size={16} className="animate-spin text-purple" />
                    ) : isSuccess ? (
                      <span className="add-success-pill">
                        <Check size={14} />
                        <span>{lang === 'vi' ? 'Đã thêm' : 'Added'}</span>
                      </span>
                    ) : (
                      <Plus size={18} className="text-muted" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
