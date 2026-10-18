import React from 'react';
import { ChevronRight, Play, Pause, Music2, Sparkles, Disc3 } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

export default function RecentListeningSection({
  songs = [],
  onOpenRecentDrawer,
  lang = 'vi'
}) {
  const { history, currentSong, isPlaying, playSong, togglePlay } = useAudio();

  // Lọc lịch sử: Chỉ hiển thị các bài hát thực sự còn tồn tại trong kho nhạc Supabase
  const validHistory = history.filter((item) => songs.some((s) => s.id === item.id));
  const displayItems = validHistory.length > 0 ? validHistory : songs.slice(0, 6);

  if (displayItems.length === 0) return null;

  const handleCardClick = (song) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playSong(song);
    }
  };

  return (
    <section className="recent-listening-section">
      {/* Header matching exact user image */}
      <div className="section-header-row">
        <h3 className="section-title-bold">
          {lang === 'vi' ? 'Nghe Gần Đây' : 'Recently Played'}
        </h3>

        <button
          type="button"
          className="section-see-all-btn"
          onClick={onOpenRecentDrawer}
          title={lang === 'vi' ? 'Xem toàn bộ lịch sử nghe' : 'View full history'}
        >
          <span>{lang === 'vi' ? 'TẤT CẢ' : 'ALL'}</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Horizontal Cards Grid matching exact user image (Row of Album Covers) */}
      <div className="recent-cards-scroll-row">
        {displayItems.map((item, index) => {
          const isCurrent = currentSong?.id === item.id;
          const isItemPlaying = isCurrent && isPlaying;

          return (
            <div
              key={`recent-${item.id || index}`}
              className={`recent-album-card ${isCurrent ? 'active' : ''}`}
              onClick={() => handleCardClick(item)}
            >
              {/* Cover Art Box */}
              <div className="recent-card-cover-box">
                {item.cover_url ? (
                  <img
                    src={item.cover_url}
                    alt={item.title}
                    className={`recent-card-img ${isItemPlaying ? 'playing-glow' : ''}`}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="recent-card-placeholder">
                    <Disc3 size={40} className="text-purple" />
                  </div>
                )}

                {/* Hover Play Overlay */}
                <div className="recent-card-overlay">
                  <button
                    type="button"
                    className="recent-card-play-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(item);
                    }}
                    title={isItemPlaying ? 'Tạm dừng' : 'Phát'}
                  >
                    {isItemPlaying ? (
                      <Pause size={20} className="fill-white" />
                    ) : (
                      <Play size={20} className="fill-white translate-x-0.5" />
                    )}
                  </button>
                </div>

                {/* Equalizer indicator if playing */}
                {isItemPlaying && (
                  <div className="recent-card-eq-badge">
                    <div className="mini-equalizer-bars">
                      <span className="bar bar1" />
                      <span className="bar bar2" />
                      <span className="bar bar3" />
                    </div>
                  </div>
                )}
              </div>

              {/* Title & Artist under cover */}
              <div className="recent-card-info">
                <h4 className="recent-card-title" title={item.title}>
                  {item.title}
                </h4>
                <p className="recent-card-artist" title={item.artist}>
                  {item.artist}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
