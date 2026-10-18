import React, { useState } from 'react';
import { Flame, Play, Pause, Heart, MoreHorizontal, TrendingUp, Music2 } from 'lucide-react';
import SongActionMenu from '../common/SongActionMenu';

export default function TopHitsSection({
  songs = [],
  currentSong,
  isPlaying,
  favorites = [],
  onPlaySong,
  onToggleFavorite,
  onOpenAddToPlaylist,
  lang = 'vi'
}) {
  const [activeMenuSong, setActiveMenuSong] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  // Featured songs or top songs
  const topHits = songs
    .filter((s) => s.is_featured || true)
    .slice(0, 6);

  if (topHits.length === 0) return null;

  const handleOpenMenu = (e, song) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 6,
      left: Math.max(16, rect.left - 180),
    });
    setActiveMenuSong(song);
  };

  const getRankBadgeClass = (index) => {
    if (index === 0) return 'rank-first';
    if (index === 1) return 'rank-second';
    if (index === 2) return 'rank-third';
    return 'rank-normal';
  };

  return (
    <section className="top-hits-section">
      <div className="section-header-row">
        <div className="header-left-group">
          <h3 className="section-title-bold flex items-center gap-2">
            <Flame size={22} className="text-amber-500 fill-amber-500" />
            <span>{lang === 'vi' ? 'Được Nghe Nhiều Nhất' : 'Most Popular Hits'}</span>
          </h3>
          <span className="section-badge-tag rank-tag">
            <TrendingUp size={12} className="inline mr-1" />
            TOP HITS
          </span>
        </div>
      </div>

      <div className="top-hits-grid">
        {topHits.map((song, index) => {
          const isCurrent = currentSong?.id === song.id;
          const isFavorited = favorites.includes(song.id);

          return (
            <div
              key={`top-${song.id}`}
              className={`top-hit-card ${isCurrent ? 'active' : ''}`}
              onClick={() => onPlaySong(song, topHits)}
            >
              {/* Rank Number */}
              <div className={`top-hit-rank ${getRankBadgeClass(index)}`}>
                <span>{index + 1}</span>
              </div>

              {/* Cover Art */}
              <div className="top-hit-cover-wrap">
                {song.cover_url ? (
                  <img
                    src={song.cover_url}
                    alt={song.title}
                    className="top-hit-cover-img"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="top-hit-placeholder">
                    <Music2 size={18} />
                  </div>
                )}
                <div className="top-hit-play-overlay">
                  {isCurrent && isPlaying ? (
                    <Pause size={14} className="fill-white" />
                  ) : (
                    <Play size={14} className="fill-white translate-x-0.5" />
                  )}
                </div>
              </div>

              {/* Meta */}
              <div className="top-hit-meta">
                <h4 className="top-hit-title" title={song.title}>
                  {song.title}
                </h4>
                <p className="top-hit-artist" title={song.artist}>
                  {song.artist}
                </p>
              </div>

              {/* Genre / Mood */}
              <span className="top-hit-genre tag-pill">
                {song.genre || song.mood || 'V-Pop'}
              </span>

              {/* Duration */}
              <span className="top-hit-duration">
                {song.duration || '03:30'}
              </span>

              {/* Actions */}
              <div className="top-hit-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className={`top-hit-action-btn ${isFavorited ? 'active-fav' : ''}`}
                  onClick={() => onToggleFavorite?.(song.id)}
                  title={isFavorited ? 'Bỏ thích' : 'Thích bài hát'}
                >
                  <Heart size={16} className={isFavorited ? 'fill-red text-red' : ''} />
                </button>

                <button
                  type="button"
                  className="top-hit-action-btn"
                  onClick={(e) => handleOpenMenu(e, song)}
                  title={lang === 'vi' ? 'Tùy chọn' : 'Options'}
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
