import React, { useState } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Heart, MoreHorizontal, Volume2, Volume1, VolumeX, Mic2, ListMusic, 
  Music2, Loader2, X, Trash2, Disc3, Sparkles
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

export default function ZingPlayer({
  isFavorite,
  onToggleFavorite,
  lang = 'vi'
}) {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    isLoading,
    queue,
    queueIndex,
    history,
    isQueueOpen,
    isLyricsOpen,
    togglePlay,
    playNext,
    playPrev,
    seek,
    changeVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    toggleQueue,
    toggleLyrics,
    playSong,
    addToQueue,
    moveQueueItem,
    removeFromQueue,
    clearQueue,
    clearHistory,
  } = useAudio();

  const [drawerTab, setDrawerTab] = useState('queue'); // 'queue' | 'history'
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    if (isNaN(secs) || secs <= 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeekChange = (e) => {
    setIsSeeking(true);
    setSeekValue(parseFloat(e.target.value));
  };

  const handleSeekCommit = (e) => {
    const val = parseFloat(e.target.value);
    seek(val);
    setIsSeeking(false);
  };

  const currentDisplayTime = isSeeking ? seekValue : currentTime;
  const progressPercent = duration ? (currentDisplayTime / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  return (
    <>
      <footer className="zing-player-bar">
        <div className="player-inner-layout">
          
          {/* Left: Song Details */}
          <div className="player-left-song">
            {currentSong ? (
              <>
                <div className={`player-song-thumb ${isPlaying ? 'rotating-disc' : ''}`}>
                  {currentSong.cover_url ? (
                    <img src={currentSong.cover_url} alt={currentSong.title} />
                  ) : (
                    <div className="thumb-placeholder">
                      <Music2 size={20} />
                    </div>
                  )}
                </div>

                <div className="player-song-meta">
                  <span className="song-title-text" title={currentSong.title}>
                    {currentSong.title}
                  </span>
                  <span className="song-artist-text" title={currentSong.artist}>
                    {currentSong.artist}
                  </span>
                </div>

                <button
                  type="button"
                  className={`player-icon-btn ${isFavorite ? 'favorited' : ''}`}
                  onClick={() => onToggleFavorite?.(currentSong.id)}
                  title={isFavorite ? 'Bỏ thích' : 'Thêm vào yêu thích'}
                >
                  <Heart size={18} fill={isFavorite ? '#ef4444' : 'none'} color={isFavorite ? '#ef4444' : '#94a3b8'} />
                </button>

                <button 
                  type="button" 
                  className="player-icon-btn"
                  title="Tùy chọn khác"
                  onClick={() => {
                    if (navigator.clipboard && currentSong?.audio_url) {
                      navigator.clipboard.writeText(currentSong.audio_url);
                      alert(lang === 'vi' ? 'Đã sao chép link audio!' : 'Audio URL copied!');
                    }
                  }}
                >
                  <MoreHorizontal size={18} />
                </button>
              </>
            ) : (
              <div className="player-empty-cue">
                <Music2 size={22} className="text-muted" />
                <span className="empty-cue-text">
                  {lang === 'vi' ? 'Chưa phát bài hát nào' : 'No track playing'}
                </span>
              </div>
            )}
          </div>

          {/* Center: Controls & Seekbar */}
          <div className="player-center-block">
            <div className="player-buttons-group">
              {/* Shuffle button */}
              <button
                type="button"
                className={`ctrl-icon-btn ${isShuffle ? 'active text-purple' : ''}`}
                onClick={toggleShuffle}
                title={isShuffle ? 'Tắt phát ngẫu nhiên' : 'Bật phát ngẫu nhiên'}
              >
                <Shuffle size={18} />
              </button>

              {/* Prev button */}
              <button
                type="button"
                className="ctrl-icon-btn"
                onClick={playPrev}
                disabled={!currentSong}
                title="Bài trước"
              >
                <SkipBack size={20} />
              </button>

              {/* Play / Pause button */}
              <button
                type="button"
                className="main-play-circle-btn"
                onClick={togglePlay}
                disabled={!currentSong && queue.length === 0}
                title={isPlaying ? 'Tạm dừng' : 'Phát'}
              >
                {isLoading && isPlaying ? (
                  <Loader2 size={20} className="animate-spin text-white" />
                ) : isPlaying ? (
                  <Pause size={20} className="fill-white" />
                ) : (
                  <Play size={20} className="fill-white translate-x-0.5" />
                )}
              </button>

              {/* Next button */}
              <button
                type="button"
                className="ctrl-icon-btn"
                onClick={playNext}
                disabled={!currentSong}
                title="Bài tiếp theo"
              >
                <SkipForward size={20} />
              </button>

              {/* Repeat button: cycles off -> all -> one -> off */}
              <button
                type="button"
                className={`ctrl-icon-btn ${repeatMode !== 'off' ? 'active text-purple' : ''}`}
                onClick={cycleRepeatMode}
                title={
                  repeatMode === 'one' 
                    ? 'Đang lặp lại 1 bài (Bấm để tắt)' 
                    : repeatMode === 'all' 
                      ? 'Đang lặp lại tất cả (Bấm để lặp 1 bài)' 
                      : 'Bật phát lại tất cả'
                }
              >
                {repeatMode === 'one' ? <Repeat1 size={19} /> : <Repeat size={18} />}
              </button>
            </div>

            {/* Seekbar */}
            <div className="player-duration-bar">
              <span className="time-text current">{formatTime(currentDisplayTime)}</span>
              <div className="progress-slider-container">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentDisplayTime}
                  onChange={handleSeekChange}
                  onMouseUp={handleSeekCommit}
                  onTouchEnd={handleSeekCommit}
                  disabled={!currentSong}
                  className="zing-progress-input"
                  style={{
                    background: `linear-gradient(to right, #9333ea ${progressPercent}%, rgba(255, 255, 255, 0.15) ${progressPercent}%)`
                  }}
                />
              </div>
              <span className="time-text total">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Volume, Lyrics, Queue */}
          <div className="player-right-block">
            {/* Lyrics Button */}
            <button 
              type="button" 
              className={`player-icon-btn ${isLyricsOpen ? 'active text-purple' : ''}`}
              onClick={toggleLyrics}
              disabled={!currentSong}
              title="Xem lời bài hát"
            >
              <Mic2 size={16} />
            </button>

            {/* Volume Control */}
            <div className="volume-control-wrap">
              <button 
                type="button" 
                className="player-icon-btn" 
                onClick={toggleMute}
                title={isMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={18} />
                ) : volume < 0.5 ? (
                  <Volume1 size={18} />
                ) : (
                  <Volume2 size={18} />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                className="zing-volume-slider"
                style={{
                  background: `linear-gradient(to right, #9333ea ${volumePercent}%, rgba(255, 255, 255, 0.15) ${volumePercent}%)`
                }}
              />
            </div>

            <div className="player-vert-divider" />

            {/* Queue Toggle Button */}
            <button 
              type="button" 
              className={`player-icon-btn queue-btn ${isQueueOpen ? 'active-queue' : ''}`}
              onClick={toggleQueue}
              title="Danh sách phát"
            >
              <ListMusic size={18} />
              {queue.length > 0 && (
                <span className="queue-counter-badge">{queue.length}</span>
              )}
            </button>
          </div>

        </div>
      </footer>

      {/* Slide-in Queue Drawer (Danh Sách Phát Chuẩn Zing MP3) */}
      {isQueueOpen && (
        <aside className="zing-queue-drawer glass-card">
          {/* Drawer Header with Tabs */}
          <div className="queue-drawer-header">
            <div className="queue-tab-buttons">
              <button
                type="button"
                className={`queue-tab-btn ${drawerTab === 'queue' ? 'active' : ''}`}
                onClick={() => setDrawerTab('queue')}
              >
                <span>{lang === 'vi' ? 'Danh Sách Phát' : 'Queue'}</span>
                {queue.length > 0 && <span className="tab-count-badge">{queue.length}</span>}
              </button>
              <button
                type="button"
                className={`queue-tab-btn ${drawerTab === 'history' ? 'active' : ''}`}
                onClick={() => setDrawerTab('history')}
              >
                <span>{lang === 'vi' ? 'Nghe Gần Đây' : 'Recent'}</span>
                {history.length > 0 && <span className="tab-count-badge">{history.length}</span>}
              </button>
            </div>

            <div className="queue-header-actions">
              {drawerTab === 'queue' && queue.length > 1 && (
                <button
                  type="button"
                  className="queue-clear-btn"
                  onClick={() => {
                    if (confirm(lang === 'vi' ? 'Xóa toàn bộ danh sách chờ?' : 'Clear upcoming queue?')) {
                      clearQueue();
                    }
                  }}
                  title="Xóa danh sách chờ"
                >
                  <Trash2 size={14} />
                  <span>{lang === 'vi' ? 'Xóa' : 'Clear'}</span>
                </button>
              )}
              {drawerTab === 'history' && history.length > 0 && (
                <button
                  type="button"
                  className="queue-clear-btn"
                  onClick={() => {
                    if (confirm(lang === 'vi' ? 'Xóa toàn bộ lịch sử nghe gần đây?' : 'Clear recent history?')) {
                      clearHistory();
                    }
                  }}
                  title="Xóa lịch sử"
                >
                  <Trash2 size={14} />
                  <span>{lang === 'vi' ? 'Xóa' : 'Clear'}</span>
                </button>
              )}
              <button
                type="button"
                className="queue-close-btn"
                onClick={toggleQueue}
                title="Đóng"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="queue-drawer-content">
            {/* TAB 1: DANH SÁCH PHÁT (QUEUE) */}
            {drawerTab === 'queue' && (
              <>
                {/* Currently Playing Card */}
                {currentSong ? (
                  <div className="queue-now-playing-box">
                    <span className="queue-sub-label">
                      {lang === 'vi' ? 'ĐANG PHÁT' : 'NOW PLAYING'}
                    </span>
                    <div className="queue-item active-playing">
                      <div className="queue-item-thumb">
                        {currentSong.cover_url ? (
                          <img src={currentSong.cover_url} alt={currentSong.title} />
                        ) : (
                          <Music2 size={18} />
                        )}
                        {isPlaying && (
                          <div className="mini-equalizer-bars">
                            <span className="bar bar1" />
                            <span className="bar bar2" />
                            <span className="bar bar3" />
                          </div>
                        )}
                      </div>
                      <div className="queue-item-meta">
                        <span className="queue-title">{currentSong.title}</span>
                        <span className="queue-artist">{currentSong.artist}</span>
                      </div>
                      <span className="queue-duration">{currentSong.duration || '03:30'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="queue-empty-tip">
                    <p>{lang === 'vi' ? 'Chưa có bài hát nào đang phát.' : 'No track playing.'}</p>
                  </div>
                )}

                {/* Upcoming Queue */}
                <div className="queue-upcoming-box">
                  <div className="upcoming-header-row">
                    <span className="queue-sub-label">
                      {lang === 'vi' ? 'TIẾP THEO' : 'NEXT UP'}
                    </span>
                    {queue.length > 1 && (
                      <span className="queue-sub-info">
                        {queue.filter((s) => s.id !== currentSong?.id).length} {lang === 'vi' ? 'bài tiếp theo' : 'tracks next'}
                      </span>
                    )}
                  </div>

                  {queue.length <= 1 ? (
                    <div className="queue-empty-tip">
                      <Sparkles size={20} className="text-purple mb-2 mx-auto" />
                      <p className="font-semibold text-white mb-1">
                        {lang === 'vi' ? 'Danh sách chờ đang trống' : 'Queue is empty'}
                      </p>
                      <p className="text-xs text-muted">
                        {lang === 'vi'
                          ? 'Bấm nút "..." trên bất kỳ bài hát nào để chọn "Thêm vào danh sách phát" hoặc "Phát tiếp theo".'
                          : 'Click "..." on any song to add to queue or play next.'}
                      </p>
                    </div>
                  ) : (
                    <div className="queue-list-scroll">
                      {queue.map((song, idx) => {
                        const isCurrent = song.id === currentSong?.id;
                        if (isCurrent) return null;

                        const canMoveUp = idx > (queueIndex + 1);
                        const canMoveDown = idx < queue.length - 1;

                        return (
                          <div 
                            key={`${song.id}-${idx}`} 
                            className="queue-item"
                            onClick={() => playSong(song)}
                          >
                            <div className="queue-item-thumb">
                              {song.cover_url ? (
                                <img src={song.cover_url} alt={song.title} />
                              ) : (
                                <Music2 size={16} />
                              )}
                              <div className="queue-play-hover">
                                <Play size={14} className="fill-white" />
                              </div>
                            </div>

                            <div className="queue-item-meta">
                              <span className="queue-title">{song.title}</span>
                              <span className="queue-artist">{song.artist}</span>
                            </div>

                            <span className="queue-duration">{song.duration || '03:30'}</span>

                            {/* Reorder and Delete actions */}
                            <div className="queue-item-actions" onClick={(e) => e.stopPropagation()}>
                              {canMoveUp && (
                                <button
                                  type="button"
                                  className="queue-reorder-btn"
                                  onClick={() => moveQueueItem(idx, idx - 1)}
                                  title="Đưa lên trên"
                                >
                                  ▲
                                </button>
                              )}
                              {canMoveDown && (
                                <button
                                  type="button"
                                  className="queue-reorder-btn"
                                  onClick={() => moveQueueItem(idx, idx + 1)}
                                  title="Đưa xuống dưới"
                                >
                                  ▼
                                </button>
                              )}
                              <button
                                type="button"
                                className="queue-remove-btn"
                                onClick={() => removeFromQueue(song.id)}
                                title="Xóa khỏi danh sách"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* TAB 2: NGHE GẦN ĐÂY (HISTORY) */}
            {drawerTab === 'history' && (
              <div className="queue-history-box">
                {history.length === 0 ? (
                  <div className="queue-empty-tip">
                    <p>{lang === 'vi' ? 'Bạn chưa nghe bài hát nào gần đây.' : 'No recent listening history.'}</p>
                  </div>
                ) : (
                  <div className="queue-list-scroll">
                    {history.map((song, idx) => {
                      const isCurrent = song.id === currentSong?.id;

                      return (
                        <div
                          key={`hist-${song.id}-${idx}`}
                          className={`queue-item ${isCurrent ? 'active-playing' : ''}`}
                          onClick={() => playSong(song)}
                        >
                          <div className="queue-item-thumb">
                            {song.cover_url ? (
                              <img src={song.cover_url} alt={song.title} />
                            ) : (
                              <Music2 size={16} />
                            )}
                            {isCurrent && isPlaying && (
                              <div className="mini-equalizer-bars">
                                <span className="bar bar1" />
                                <span className="bar bar2" />
                                <span className="bar bar3" />
                              </div>
                            )}
                          </div>

                          <div className="queue-item-meta">
                            <span className="queue-title">{song.title}</span>
                            <span className="queue-artist">{song.artist}</span>
                          </div>

                          <span className="queue-duration">{song.duration || '03:30'}</span>

                          <button
                            type="button"
                            className="queue-add-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToQueue(song);
                            }}
                            title="Thêm vào hàng đợi"
                          >
                            <ListMusic size={15} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </aside>
      )}

      {/* Lyrics Modal / Overlay */}
      {isLyricsOpen && currentSong && (
        <div className="lyrics-modal-backdrop" onClick={toggleLyrics}>
          <div className="lyrics-modal-card glass-card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="lyrics-close-btn" onClick={toggleLyrics}>
              <X size={22} />
            </button>

            <div className="lyrics-header">
              <div className="lyrics-cover-disc">
                {currentSong.cover_url ? (
                  <img src={currentSong.cover_url} alt={currentSong.title} />
                ) : (
                  <Disc3 size={64} className="text-purple" />
                )}
              </div>
              <h2 className="lyrics-song-title">{currentSong.title}</h2>
              <p className="lyrics-song-artist">{currentSong.artist}</p>
              <div className="lyrics-mood-badge">
                <Sparkles size={13} className="text-cyan" />
                <span>Mood: {currentSong.mood?.toUpperCase() || 'CHILL'}</span>
              </div>
            </div>

            <div className="lyrics-body-content">
              {currentSong.lyrics ? (
                <div className="lyrics-lines">
                  {currentSong.lyrics.split('\n').map((line, idx) => (
                    <p key={idx} className="lyrics-line">{line}</p>
                  ))}
                </div>
              ) : (
                <div className="lyrics-empty-state">
                  <Mic2 size={36} className="text-muted mb-2" />
                  <h4>{lang === 'vi' ? 'Lời bài hát đang được cập nhật' : 'Lyrics coming soon'}</h4>
                  <p>
                    {lang === 'vi'
                      ? 'Admin có thể thêm lời bài hát chi tiết khi phát hành ca khúc trong phiên bản tiếp theo.'
                      : 'Lyrics will be available once updated by Admin.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
