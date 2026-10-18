import React, { useState } from 'react';
import { RotateCw, Music2, Play, Pause, Heart, MoreHorizontal, Sparkles } from 'lucide-react';
import SongActionMenu from '../common/SongActionMenu';

export default function SongSuggestions({
  songs = [],
  currentSong,
  isPlaying,
  favorites = [],
  onPlaySong,
  onToggleFavorite,
  onOpenAddToPlaylist,
  onRefresh,
  lang
}) {
  const [activeMenuSong, setActiveMenuSong] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  const hasData = songs && songs.length > 0;

  // Shuffle or slice 9 songs
  const displaySongs = React.useMemo(() => {
    if (!hasData) return [];
    if (shuffleSeed === 0) return songs.slice(0, 9);
    // Shuffle copy
    const shuffled = [...songs].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 9);
  }, [songs, hasData, shuffleSeed]);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    setShuffleSeed((prev) => prev + 1);
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleOpenMenu = (e, song) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 6,
      left: Math.max(16, rect.left - 180),
    });
    setActiveMenuSong(song);
  };

  return (
    <section className="song-suggestions-section">
      {/* Section Header matching exact user image */}
      <div className="song-suggestions-header">
        <h3 className="section-main-heading">
          {lang === 'vi' ? 'Gợi Ý Bài Hát' : 'Suggested Songs'}
        </h3>

        <button
          type="button"
          className={`refresh-btn-pill ${isRefreshing ? 'refreshing' : ''}`}
          onClick={handleRefreshClick}
          title={lang === 'vi' ? 'Làm mới danh sách gợi ý' : 'Refresh suggestions'}
        >
          <RotateCw size={14} className={`refresh-icon ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{lang === 'vi' ? 'LÀM MỚI' : 'REFRESH'}</span>
        </button>
      </div>

      {/* 3-Column Compact Song Grid (Zing MP3 Style) */}
      <div className="compact-songs-grid">
        {hasData ? (
          displaySongs.map((song) => {
            const isCurrent = currentSong?.id === song.id;
            const isFavorited = favorites.includes(song.id);

            return (
              <div
                key={song.id}
                className={`compact-song-card ${isCurrent ? 'active' : ''}`}
                onClick={() => onPlaySong(song)}
              >
                {/* Small Cover Art */}
                <div className="compact-cover-wrap">
                  {song.cover_url ? (
                    <img src={song.cover_url} alt={song.title} className="compact-cover-img" />
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

                {/* Song Meta */}
                <div className="compact-meta">
                  <h4 className="compact-song-title" title={song.title}>
                    {song.title}
                  </h4>
                  <p className="compact-song-artist" title={song.artist}>
                    {song.artist}
                  </p>
                </div>

                {/* Actions */}
                <div className="compact-actions">
                  <button
                    type="button"
                    className={`compact-heart-btn ${isFavorited ? 'favorited' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(song.id);
                    }}
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
          })
        ) : (
          /* Blueprint Grid (When no songs yet) */
          Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="compact-song-card blueprint-card">
              <div className="compact-cover-wrap blueprint-cover">
                <Music2 size={16} className="text-muted" />
              </div>

              <div className="compact-meta">
                <div className="blueprint-line title-line" />
                <div className="blueprint-line artist-line" />
              </div>

              <div className="compact-actions">
                <span className="blueprint-slot-num">#{index + 1}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Song Action Popover Menu (Queue, Playlist, Share) */}
      <SongActionMenu
        song={activeMenuSong}
        isOpen={Boolean(activeMenuSong)}
        onClose={() => setActiveMenuSong(null)}
        position={menuPos}
        onOpenAddToPlaylist={onOpenAddToPlaylist}
        isFavorite={favorites.includes(activeMenuSong?.id)}
        onToggleFavorite={onToggleFavorite}
      />

      {!hasData && (
        <div className="blueprint-notice-banner glass-card">
          <div className="notice-icon-box">
            <Sparkles size={20} className="text-cyan" />
          </div>
          <div className="notice-text-content">
            <h4 className="notice-title">
              {lang === 'vi' ? 'Bố cục bài hát đã sẵn sàng tiếp nhận dữ liệu thật' : 'Song grid layout ready for live data'}
            </h4>
            <p className="notice-desc">
              {lang === 'vi' 
                ? 'Khi Admin tải lên file MP3 và ảnh bìa bài hát từ trang Quản trị, các bài hát sẽ tự động xếp vào lưới 3 cột theo chuẩn Zing MP3 tại đây.' 
                : 'When Admin uploads MP3 files and cover art from the Admin Dashboard, tracks will automatically populate into this 3-column grid.'}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
