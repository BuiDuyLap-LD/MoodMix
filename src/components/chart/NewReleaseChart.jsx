import React, { useState } from 'react';
import { Play, Pause, Heart, MoreHorizontal, Music2, Sparkles } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import SongActionMenu from '../common/SongActionMenu';

export default function NewReleaseChart({
  songs = [],
  favorites = [],
  onToggleFavorite,
  onOpenAddToPlaylist,
  lang = 'vi'
}) {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const [activeMenuSong, setActiveMenuSong] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  // Sort songs by created_at desc (or newest releases)
  const chartSongs = [...songs].sort((a, b) => {
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  const handleOpenMenu = (e, song) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 6,
      left: Math.max(16, rect.left - 180),
    });
    setActiveMenuSong(song);
  };

  // Play entire chart from track 1
  const handlePlayAll = () => {
    if (chartSongs.length > 0) {
      if (currentSong && chartSongs.some((s) => s.id === currentSong.id)) {
        togglePlay();
      } else {
        playSong(chartSongs[0], chartSongs);
      }
    }
  };

  // Deterministic trend indicator simulation (matching screenshot style)
  const getTrendIndicator = (index, songId) => {
    // Generate simulated stable trend based on song ID character code
    const charCode = (songId?.charCodeAt(0) || index) % 3;
    if (charCode === 0) {
      return (
        <div className="trend-dash">
          <span>—</span>
        </div>
      );
    } else if (charCode === 1) {
      const upNum = ((songId?.charCodeAt(1) || 1) % 3) + 1;
      return (
        <div className="trend-up">
          <span className="trend-arrow">▲</span>
          <span className="trend-num">{upNum}</span>
        </div>
      );
    } else {
      return (
        <div className="trend-dash">
          <span>—</span>
        </div>
      );
    }
  };

  const isChartPlaying = currentSong && chartSongs.some((s) => s.id === currentSong.id) && isPlaying;

  return (
    <div className="bxh-new-release-page">
      {/* Header matching exact user image: "BXH Nhạc Mới" + Circular Play Icon */}
      <div className="bxh-page-header">
        <h1 className="bxh-main-title">
          {lang === 'vi' ? 'BXH Nhạc Mới' : 'New Releases Chart'}
        </h1>

        {chartSongs.length > 0 && (
          <button
            type="button"
            className="bxh-header-play-circle"
            onClick={handlePlayAll}
            title={isChartPlaying ? 'Tạm dừng BXH' : 'Phát toàn bộ BXH'}
          >
            {isChartPlaying ? (
              <Pause size={18} className="fill-black text-black" />
            ) : (
              <Play size={18} className="fill-black text-black translate-x-0.5" />
            )}
          </button>
        )}
      </div>

      {/* Main Chart Table */}
      {chartSongs.length === 0 ? (
        <div className="bxh-empty-card glass-card">
          <Music2 size={48} className="text-purple mb-3" />
          <h3>{lang === 'vi' ? 'Chưa có bài hát nào trên bảng xếp hạng' : 'No tracks on chart yet'}</h3>
          <p>
            {lang === 'vi'
              ? 'Admin chưa upload bài hát mới. Khi bài hát được thêm, bảng xếp hạng sẽ tự động cập nhật tại đây.'
              : 'The chart will automatically update when new songs are uploaded by Admin.'}
          </p>
        </div>
      ) : (
        <div className="bxh-chart-table">
          {chartSongs.map((song, index) => {
            const rank = index + 1;
            const isCurrent = currentSong?.id === song.id;
            const isFav = favorites.includes(song.id);

            // Rank styling: 1 = Blue/Cyan, 2 = Green, 3 = Red/Coral, 4+ = Gray
            let rankClass = 'rank-other';
            if (rank === 1) rankClass = 'rank-1';
            else if (rank === 2) rankClass = 'rank-2';
            else if (rank === 3) rankClass = 'rank-3';

            return (
              <div
                key={song.id}
                className={`bxh-chart-row ${isCurrent ? 'active' : ''}`}
                onClick={() => playSong(song, chartSongs)}
              >
                {/* 1. Rank Number (Styled outline font like in screenshot) */}
                <div className={`bxh-col-rank ${rankClass}`}>
                  <span className="rank-number-text">{rank}</span>
                </div>

                {/* 2. Rank Trend (Dash or Up Arrow) */}
                <div className="bxh-col-trend">
                  {getTrendIndicator(index, song.id)}
                </div>

                {/* 3. Cover Thumbnail & Title / Artist */}
                <div className="bxh-col-song">
                  <div className="bxh-song-cover">
                    {song.cover_url ? (
                      <img
                        src={song.cover_url}
                        alt={song.title}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="bxh-song-placeholder">
                        <Music2 size={18} />
                      </div>
                    )}

                    {/* Hover Play Button */}
                    <div className="bxh-play-overlay">
                      {isCurrent && isPlaying ? (
                        <Pause size={16} className="fill-white" />
                      ) : (
                        <Play size={16} className="fill-white translate-x-0.5" />
                      )}
                    </div>
                  </div>

                  <div className="bxh-song-meta">
                    <span className="bxh-song-title" title={song.title}>
                      {song.title}
                    </span>
                    <span className="bxh-song-artist" title={song.artist}>
                      {song.artist}
                    </span>
                  </div>
                </div>

                {/* 4. Album / Single Info (Center Column from screenshot) */}
                <div className="bxh-col-album">
                  <span className="bxh-album-text" title={`${song.title} (Single)`}>
                    {song.genre ? `${song.title} (${song.genre})` : `${song.title} (Single)`}
                  </span>
                </div>

                {/* 5. Duration & Row Actions */}
                <div className="bxh-col-duration-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className={`bxh-action-btn ${isFav ? 'active-fav' : ''}`}
                    onClick={() => onToggleFavorite?.(song.id)}
                    title={isFav ? 'Bỏ thích' : 'Thích bài hát'}
                  >
                    <Heart size={16} className={isFav ? 'fill-red text-red' : ''} />
                  </button>

                  <span className="bxh-duration-text">
                    {song.duration || '03:30'}
                  </span>

                  <button
                    type="button"
                    className="bxh-action-btn"
                    onClick={(e) => handleOpenMenu(e, song)}
                    title={lang === 'vi' ? 'Tùy chọn bài hát' : 'Options'}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Popover Action Menu */}
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
    </div>
  );
}
