import React, { useState } from 'react';
import { Sparkles, Play, Pause, Heart, MoreHorizontal, Music2, Clock, Calendar } from 'lucide-react';
import SongActionMenu from '../common/SongActionMenu';

export default function NewReleasesSection({
  songs = [],
  currentSong,
  isPlaying,
  favorites = [],
  onPlaySong,
  onToggleFavorite,
  onOpenAddToPlaylist,
  lang = 'vi'
}) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'vpop' | 'others'
  const [activeMenuSong, setActiveMenuSong] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  // Sort songs by created_at desc (newest first)
  const sortedSongs = [...songs].sort((a, b) => {
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  const filteredSongs = sortedSongs.filter((s) => {
    if (activeFilter === 'vpop') return (s.genre?.toLowerCase() || '').includes('v-pop') || (s.genre?.toLowerCase() || '').includes('pop');
    if (activeFilter === 'others') return !(s.genre?.toLowerCase() || '').includes('v-pop');
    return true;
  }).slice(0, 9); // Take top 9 newest songs

  if (filteredSongs.length === 0) return null;

  const handleOpenMenu = (e, song) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 6,
      left: Math.max(16, rect.left - 180),
    });
    setActiveMenuSong(song);
  };

  const formatReleaseDate = (dateStr) => {
    if (!dateStr) return lang === 'vi' ? 'Vừa mới đăng' : 'Just added';
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffHours < 1) return lang === 'vi' ? 'Vừa xong' : 'Just now';
    if (diffHours < 24) return `${diffHours} ${lang === 'vi' ? 'giờ trước' : 'hours ago'}`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays <= 7) return `${diffDays} ${lang === 'vi' ? 'ngày trước' : 'days ago'}`;
    return date.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US');
  };

  return (
    <section className="new-releases-section">
      <div className="section-header-row">
        <div className="header-left-group">
          <h3 className="section-title-bold">
            {lang === 'vi' ? 'Mới Phát Hành' : 'New Releases'}
          </h3>
          <span className="section-badge-tag">
            {lang === 'vi' ? 'Mới Nhất Từ Admin' : 'Latest Uploads'}
          </span>
        </div>

        {/* Quick Filter Tabs */}
        <div className="release-filter-tabs">
          <button
            type="button"
            className={`filter-tab-pill ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            {lang === 'vi' ? 'TẤT CẢ' : 'ALL'}
          </button>
          <button
            type="button"
            className={`filter-tab-pill ${activeFilter === 'vpop' ? 'active' : ''}`}
            onClick={() => setActiveFilter('vpop')}
          >
            VIỆT NAM
          </button>
          <button
            type="button"
            className={`filter-tab-pill ${activeFilter === 'others' ? 'active' : ''}`}
            onClick={() => setActiveFilter('others')}
          >
            QUỐC TẾ
          </button>
        </div>
      </div>

      {/* Grid of 3 columns */}
      <div className="compact-songs-grid">
        {filteredSongs.map((song) => {
          const isCurrent = currentSong?.id === song.id;
          const isFavorited = favorites.includes(song.id);

          return (
            <div
              key={`new-${song.id}`}
              className={`compact-song-card ${isCurrent ? 'active' : ''}`}
              onClick={() => onPlaySong(song)}
            >
              <div className="compact-cover-wrap">
                {song.cover_url ? (
                  <img
                    src={song.cover_url}
                    alt={song.title}
                    className="compact-cover-img"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="compact-cover-placeholder">
                    <Music2 size={18} />
                  </div>
                )}
                <div className="compact-play-hover">
                  {isCurrent && isPlaying ? (
                    <Pause size={14} className="fill-white" />
                  ) : (
                    <Play size={14} className="fill-white translate-x-0.5" />
                  )}
                </div>
              </div>

              <div className="compact-meta">
                <div className="release-meta-top">
                  <h4 className="compact-song-title" title={song.title}>
                    {song.title}
                  </h4>
                  <span className="new-badge-pill">NEW</span>
                </div>
                <p className="compact-song-artist" title={song.artist}>
                  {song.artist}
                </p>
                <span className="release-time-text">
                  <Clock size={11} className="inline mr-1 opacity-70" />
                  {formatReleaseDate(song.created_at)}
                </span>
              </div>

              <div className="compact-actions">
                <button
                  type="button"
                  className={`compact-heart-btn ${isFavorited ? 'favorited' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite?.(song.id);
                  }}
                  title={isFavorited ? 'Bỏ thích' : 'Thích bài hát'}
                >
                  <Heart size={16} fill={isFavorited ? '#ef4444' : 'none'} color={isFavorited ? '#ef4444' : '#94a3b8'} />
                </button>

                <button
                  type="button"
                  className="compact-more-btn"
                  onClick={(e) => handleOpenMenu(e, song)}
                  title={lang === 'vi' ? 'Tùy chọn bài hát' : 'Song options'}
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Song Action Popover Menu */}
      <SongActionMenu
        song={activeMenuSong}
        isOpen={Boolean(activeMenuSong)}
        onClose={() => setActiveMenuSong(null)}
        position={menuPos}
        onOpenAddToPlaylist={onOpenAddToPlaylist}
        isFavorite={favorites.includes(activeMenuSong?.id)}
        onToggleFavorite={onToggleFavorite}
        lang={lang}
      />
    </section>
  );
}
