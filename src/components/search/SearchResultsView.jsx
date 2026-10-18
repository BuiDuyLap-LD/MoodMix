import React, { useState } from 'react';
import { Search, Play, Pause, Heart, MoreHorizontal, Music2, Clock, Sparkles, X, Compass, Disc3 } from 'lucide-react';
import SongActionMenu from '../common/SongActionMenu';

export default function SearchResultsView({
  searchQuery = '',
  onClearSearch,
  songs = [],
  currentSong,
  isPlaying,
  favorites = [],
  onPlaySong,
  onToggleFavorite,
  onOpenAddToPlaylist,
  lang = 'vi',
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'songs'
  const [activeMenuSong, setActiveMenuSong] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const hasResults = songs && songs.length > 0;
  const topMatch = hasResults ? songs[0] : null;

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
    <div className="search-results-page-wrapper">
      {/* Search Header Banner */}
      <div className="search-results-header glass-card">
        <div className="search-header-left">
          <div className="search-badge-pill">
            <Search size={13} />
            <span>{lang === 'vi' ? 'KẾT QUẢ TÌM KIẾM' : 'SEARCH RESULTS'}</span>
          </div>
          <h2 className="search-query-heading">
            {lang === 'vi' ? 'Tìm kiếm cho:' : 'Search for:'}{' '}
            <span className="search-query-text">"{searchQuery}"</span>
          </h2>
          <p className="search-results-count">
            {lang === 'vi'
              ? `Tìm thấy ${songs.length} bài hát phù hợp`
              : `Found ${songs.length} matching songs`}
          </p>
        </div>

        <button
          type="button"
          className="search-clear-view-btn"
          onClick={onClearSearch}
          title={lang === 'vi' ? 'Xóa tìm kiếm và quay lại' : 'Clear search and go back'}
        >
          <X size={16} />
          <span>{lang === 'vi' ? 'Đóng tìm kiếm' : 'Close search'}</span>
        </button>
      </div>

      {!hasResults ? (
        /* Empty Search Results State */
        <div className="search-empty-state glass-card">
          <div className="search-empty-icon-circle">
            <Search size={44} className="text-purple" />
          </div>
          <h3 className="search-empty-title">
            {lang === 'vi'
              ? `Không tìm thấy kết quả nào cho "${searchQuery}"`
              : `No results found for "${searchQuery}"`}
          </h3>
          <p className="search-empty-desc">
            {lang === 'vi'
              ? 'Hãy thử kiểm tra lại chính tả, tìm kiếm bằng tên bài hát, tên ca sĩ (như Diệu Kiên, Phát Huy) hoặc thử từ khóa ngắn hơn.'
              : 'Try checking your spelling, searching with artist name, song title, or try shorter keywords.'}
          </p>
          <button
            type="button"
            className="search-empty-action-btn"
            onClick={onClearSearch}
          >
            <Compass size={16} />
            <span>{lang === 'vi' ? 'Quay lại Trang Khám Phá' : 'Back to Explore'}</span>
          </button>
        </div>
      ) : (
        /* Populated Search Results */
        <div className="search-content-body">
          {/* Top Match Spotlight (If 1 or more results) */}
          {topMatch && (
            <div className="search-top-match-section">
              <h3 className="search-section-subtitle">
                {lang === 'vi' ? 'Kết Quả Hàng Đầu' : 'Top Result'}
              </h3>

              <div
                className={`search-top-match-card glass-card ${currentSong?.id === topMatch.id ? 'active' : ''}`}
                onClick={() => onPlaySong?.(topMatch, songs)}
              >
                <div className="top-match-cover-box">
                  {topMatch.cover_url ? (
                    <img
                      src={topMatch.cover_url}
                      alt={topMatch.title}
                      className="top-match-cover-img"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="top-match-fallback">
                      <Disc3 size={36} className="text-purple" />
                    </div>
                  )}

                  {currentSong?.id === topMatch.id && isPlaying && (
                    <div className="top-match-eq-overlay">
                      <span className="eq-bar bar1" />
                      <span className="eq-bar bar2" />
                      <span className="eq-bar bar3" />
                    </div>
                  )}
                </div>

                <div className="top-match-info">
                  <span className="top-match-tag">
                    <Sparkles size={11} /> {lang === 'vi' ? 'BÀI HÁT' : 'SONG'}
                  </span>
                  <h4 className="top-match-title" title={topMatch.title}>
                    {topMatch.title}
                  </h4>
                  <p className="top-match-artist">{topMatch.artist}</p>

                  <div className="top-match-actions">
                    <button
                      type="button"
                      className="top-match-play-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlaySong?.(topMatch, songs);
                      }}
                    >
                      {currentSong?.id === topMatch.id && isPlaying ? (
                        <>
                          <Pause size={16} className="fill-white" />
                          <span>{lang === 'vi' ? 'TẠM DỪNG' : 'PAUSE'}</span>
                        </>
                      ) : (
                        <>
                          <Play size={16} className="fill-white" />
                          <span>{lang === 'vi' ? 'PHÁT NGAY' : 'PLAY NOW'}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className={`top-match-icon-btn ${favorites.includes(topMatch.id) ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite?.(topMatch.id);
                      }}
                      title={lang === 'vi' ? 'Yêu thích' : 'Favorite'}
                    >
                      <Heart
                        size={18}
                        className={favorites.includes(topMatch.id) ? 'fill-red text-red' : ''}
                      />
                    </button>

                    <button
                      type="button"
                      className="top-match-icon-btn"
                      onClick={(e) => handleOpenMenu(e, topMatch)}
                      title={lang === 'vi' ? 'Thao tác khác' : 'More'}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Results Table */}
          <div className="search-table-section">
            <h3 className="search-section-subtitle">
              {lang === 'vi' ? 'Danh Sách Bài Hát' : 'All Songs'} ({songs.length})
            </h3>

            <div className="search-table-wrapper glass-card">
              <div className="search-table-header">
                <span className="col-num">#</span>
                <span className="col-title">{lang === 'vi' ? 'BÀI HÁT' : 'SONG'}</span>
                <span className="col-genre">{lang === 'vi' ? 'THỂ LOẠI / MOOD' : 'GENRE / MOOD'}</span>
                <span className="col-actions">{lang === 'vi' ? 'THAO TÁC' : 'ACTIONS'}</span>
              </div>

              <div className="search-table-body">
                {songs.map((song, idx) => {
                  const isCurrent = currentSong?.id === song.id;
                  const isFav = favorites.includes(song.id);

                  return (
                    <div
                      key={song.id}
                      className={`search-song-row ${isCurrent ? 'active' : ''}`}
                      onClick={() => onPlaySong?.(song, songs)}
                    >
                      {/* Index / Equalizer */}
                      <div className="col-num">
                        {isCurrent && isPlaying ? (
                          <div className="mini-equalizer-bars">
                            <span className="bar bar1" />
                            <span className="bar bar2" />
                            <span className="bar bar3" />
                          </div>
                        ) : (
                          <span className="row-index">{idx + 1}</span>
                        )}
                      </div>

                      {/* Cover & Title */}
                      <div className="col-title">
                        <div className="row-cover-wrap">
                          {song.cover_url ? (
                            <img
                              src={song.cover_url}
                              alt={song.title}
                              className="row-cover-img"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="row-cover-fallback">
                              <Music2 size={16} />
                            </div>
                          )}
                          <div className="row-play-overlay">
                            {isCurrent && isPlaying ? (
                              <Pause size={14} className="fill-white" />
                            ) : (
                              <Play size={14} className="fill-white translate-x-0.5" />
                            )}
                          </div>
                        </div>

                        <div className="row-text-info">
                          <h4 className="row-song-title" title={song.title}>
                            {song.title}
                          </h4>
                          <p className="row-song-artist" title={song.artist}>
                            {song.artist}
                          </p>
                        </div>
                      </div>

                      {/* Genre / Mood */}
                      <div className="col-genre">
                        <span className="genre-pill-tag">
                          {song.genre || song.mood || 'Pop'}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className={`row-action-btn ${isFav ? 'active' : ''}`}
                          onClick={() => onToggleFavorite?.(song.id)}
                          title={isFav ? 'Bỏ thích' : 'Yêu thích'}
                        >
                          <Heart size={16} className={isFav ? 'fill-red text-red' : ''} />
                        </button>

                        <button
                          type="button"
                          className="row-action-btn"
                          onClick={(e) => handleOpenMenu(e, song)}
                          title="Thêm vào playlist / Thao tác"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Menu */}
      <SongActionMenu
        song={activeMenuSong}
        isOpen={Boolean(activeMenuSong)}
        onClose={() => setActiveMenuSong(null)}
        position={menuPos}
        onOpenAddToPlaylist={(song) => onOpenAddToPlaylist?.(song)}
        lang={lang}
      />
    </div>
  );
}
