import React, { useState } from 'react';
import { Plus, Play, Pause, Trash2, Disc3, Music2, Sparkles, User, Globe } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

export default function PlaylistSection({
  playlists = [],
  songs = [],
  user,
  onCreatePlaylist,
  onDeletePlaylist,
  onSelectPlaylist,
  lang = 'vi'
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'mine'
  const { playSong } = useAudio();

  // Filter playlists based on tab
  const filteredPlaylists = playlists.filter((pl) => {
    if (activeTab === 'mine') {
      return pl.user_id && user && pl.user_id === user.id;
    }
    // 'all': Show public playlists and user's own playlists
    return pl.is_public || (user && pl.user_id === user.id);
  });

  // Handle clicking a playlist card -> Open detail view
  const handleClickPlaylist = (playlist) => {
    if (onSelectPlaylist) {
      onSelectPlaylist(playlist);
    }
  };

  return (
    <section className="playlist-showcase-section">
      {/* Header bar matching exact user design (Image 2) */}
      <div className="playlist-section-header">
        <div className="playlist-header-left">
          <h2 className="playlist-main-title">Playlist</h2>
          <div className="playlist-tab-nav">
            <button
              type="button"
              className={`playlist-tab-item ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <span>{lang === 'vi' ? 'TẤT CẢ' : 'ALL'}</span>
              {activeTab === 'all' && <div className="tab-active-indicator" />}
            </button>

            <button
              type="button"
              className={`playlist-tab-item ${activeTab === 'mine' ? 'active' : ''}`}
              onClick={() => setActiveTab('mine')}
            >
              <span>{lang === 'vi' ? 'CỦA TÔI' : 'MY PLAYLISTS'}</span>
              {activeTab === 'mine' && <div className="tab-active-indicator" />}
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Playlist Cards */}
      <div className="playlist-cards-grid">
        
        {/* Card 1: Tạo playlist mới (Exact design from Image 2) */}
        <div 
          className="playlist-card create-new-card"
          onClick={onCreatePlaylist}
          title={lang === 'vi' ? 'Bấm để tạo playlist mới' : 'Create new playlist'}
        >
          <div className="create-card-inner">
            <div className="create-icon-circle">
              <Plus size={32} />
            </div>
            <span className="create-card-label">
              {lang === 'vi' ? 'Tạo playlist mới' : 'Create new playlist'}
            </span>
          </div>
        </div>

        {/* Existing Playlists Cards */}
        {filteredPlaylists.map((playlist) => {
          const isOwner = user && playlist.user_id === user.id;

          return (
            <div 
              key={playlist.id} 
              className="playlist-card"
              onClick={() => handleClickPlaylist(playlist)}
            >
              {/* Cover Art Box */}
              <div className="playlist-card-cover">
                {playlist.cover_url ? (
                  <img 
                    src={playlist.cover_url} 
                    alt={playlist.title} 
                    className="playlist-cover-img" 
                  />
                ) : (
                  <div className="playlist-cover-default">
                    <Disc3 size={48} className="text-purple" />
                    <span className="cover-sparkle-badge">
                      <Sparkles size={12} />
                    </span>
                  </div>
                )}

                {/* Hover Play Button: click opens the detail view */}
                <div className="playlist-play-overlay">
                  <button
                    type="button"
                    className="playlist-play-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClickPlaylist(playlist);
                    }}
                    title={lang === 'vi' ? 'Xem & phát playlist' : 'View & play playlist'}
                  >
                    <Play size={22} className="fill-white translate-x-0.5" />
                  </button>
                </div>

                {/* Delete button for owned playlist */}
                {isOwner && (
                  <button
                    type="button"
                    className="playlist-delete-corner-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Bạn có chắc chắn muốn xóa playlist "${playlist.title}"?`)) {
                        onDeletePlaylist?.(playlist.id);
                      }
                    }}
                    title="Xóa playlist"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Meta */}
              <div className="playlist-card-meta">
                <h4 className="playlist-card-title" title={playlist.title}>
                  {playlist.title}
                </h4>
                <p className="playlist-card-sub" title={playlist.description || playlist.creator}>
                  {playlist.description || (isOwner ? (lang === 'vi' ? 'Của tôi' : 'By me') : 'MoodMix')}
                </p>
              </div>
            </div>
          );
        })}

        {/* Empty state when user selects 'mine' and has no playlists yet */}
        {activeTab === 'mine' && filteredPlaylists.length === 0 && (
          <div className="playlist-mine-empty-notice">
            <p>
              {lang === 'vi'
                ? 'Bạn chưa tạo playlist nào. Hãy bấm "Tạo playlist mới" ở trên để bắt đầu!'
                : 'You have not created any playlist yet. Click "Create new playlist" to start!'}
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
