import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Shuffle, 
  Trash2, 
  Disc3, 
  Music2, 
  Clock, 
  Heart, 
  Compass, 
  Sparkles, 
  Lock, 
  Globe, 
  Loader2,
  ListPlus
} from 'lucide-react';
import { getPlaylistSongs, removeSongFromPlaylist } from '../../services/musicService';
import { useAudio } from '../../context/AudioContext';

export default function PlaylistDetailView({
  playlist,
  user,
  favorites = [],
  onToggleFavorite,
  onBack,
  onNavigateExplore,
  onDeletePlaylist,
  lang = 'vi'
}) {
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingSongId, setDeletingSongId] = useState(null);

  const { currentSong, isPlaying, playSong, togglePlay, setShuffle, addToQueue } = useAudio();

  // Load songs for this playlist
  const loadSongs = async () => {
    if (!playlist?.id) return;
    setIsLoading(true);
    const res = await getPlaylistSongs(playlist.id);
    setSongs(res.data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadSongs();
  }, [playlist?.id]);

  const isOwner = user && playlist?.user_id === user.id;
  const isCurrentPlaylistPlaying = songs.some((s) => s.id === currentSong?.id) && isPlaying;

  // Handle Play all
  const handlePlayAll = () => {
    if (songs.length === 0) {
      alert(lang === 'vi' ? 'Playlist này chưa có bài hát nào!' : 'This playlist is empty!');
      return;
    }
    if (isCurrentPlaylistPlaying) {
      togglePlay();
    } else {
      playSong(songs[0], songs);
    }
  };

  // Handle Shuffle Play
  const handleShufflePlay = () => {
    if (songs.length === 0) {
      alert(lang === 'vi' ? 'Playlist này chưa có bài hát nào!' : 'This playlist is empty!');
      return;
    }
    setShuffle(true);
    const randomIndex = Math.floor(Math.random() * songs.length);
    playSong(songs[randomIndex], songs);
  };

  // Handle Remove Song from playlist
  const handleRemoveSong = async (songId) => {
    if (!confirm(lang === 'vi' ? 'Bạn có muốn xóa bài hát này khỏi playlist?' : 'Remove this song from playlist?')) {
      return;
    }

    setDeletingSongId(songId);
    const res = await removeSongFromPlaylist(playlist.id, songId);
    setDeletingSongId(null);

    if (res.success) {
      setSongs((prev) => prev.filter((s) => s.id !== songId));
    } else {
      alert(lang === 'vi' ? 'Không thể xóa bài hát khỏi playlist.' : 'Failed to remove song.');
    }
  };

  return (
    <div className="playlist-detail-page">
      {/* Top back bar */}
      <div className="playlist-detail-topbar">
        <button type="button" className="playlist-back-btn" onClick={onBack}>
          <ArrowLeft size={18} />
          <span>{lang === 'vi' ? 'Quay lại Thư viện' : 'Back to Library'}</span>
        </button>
      </div>

      <div className="playlist-detail-content">
        {/* Left Column: Playlist Info Card */}
        <div className="playlist-detail-left">
          <div className="playlist-large-cover-box">
            {playlist.cover_url ? (
              <img 
                src={playlist.cover_url} 
                alt={playlist.title} 
                className={`playlist-large-cover-img ${isCurrentPlaylistPlaying ? 'playing-spin' : ''}`} 
              />
            ) : (
              <div className="playlist-large-cover-default">
                <Disc3 size={84} className="text-purple animate-pulse" />
                <span className="cover-sparkle-pill">
                  <Sparkles size={14} />
                </span>
              </div>
            )}
          </div>

          <h2 className="playlist-detail-title">{playlist.title}</h2>
          <p className="playlist-detail-creator">
            {isOwner ? (lang === 'vi' ? 'Tạo bởi bạn' : 'Created by you') : 'MoodMix'}
          </p>

          <div className="playlist-detail-badges">
            <span className="detail-pill">
              {playlist.is_public ? (
                <>
                  <Globe size={12} />
                  <span>{lang === 'vi' ? 'Công khai' : 'Public'}</span>
                </>
              ) : (
                <>
                  <Lock size={12} />
                  <span>{lang === 'vi' ? 'Riêng tư' : 'Private'}</span>
                </>
              )}
            </span>
            <span className="detail-pill">
              {songs.length} {lang === 'vi' ? 'bài hát' : 'tracks'}
            </span>
          </div>

          {playlist.description && (
            <p className="playlist-detail-desc">{playlist.description}</p>
          )}

          {/* Action buttons */}
          <div className="playlist-detail-actions">
            <button
              type="button"
              className={`btn-play-all-playlist ${songs.length === 0 ? 'disabled' : ''}`}
              onClick={handlePlayAll}
              disabled={songs.length === 0}
            >
              {isCurrentPlaylistPlaying ? (
                <>
                  <Pause size={18} className="fill-white" />
                  <span>{lang === 'vi' ? 'TẠM DỪNG' : 'PAUSE'}</span>
                </>
              ) : (
                <>
                  <Play size={18} className="fill-white" />
                  <span>{lang === 'vi' ? 'PHÁT TẤT CẢ' : 'PLAY ALL'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="btn-shuffle-playlist"
              onClick={handleShufflePlay}
              disabled={songs.length === 0}
              title={lang === 'vi' ? 'Phát ngẫu nhiên' : 'Shuffle play'}
            >
              <Shuffle size={16} />
              <span>{lang === 'vi' ? 'XÁO TRỘN' : 'SHUFFLE'}</span>
            </button>

            {isOwner && (
              <button
                type="button"
                className="btn-delete-playlist"
                onClick={() => {
                  if (confirm(lang === 'vi' ? `Bạn có chắc muốn xóa playlist "${playlist.title}"?` : 'Delete this playlist?')) {
                    onDeletePlaylist?.(playlist.id);
                    onBack();
                  }
                }}
                title={lang === 'vi' ? 'Xóa playlist này' : 'Delete playlist'}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Song List */}
        <div className="playlist-detail-right">
          {isLoading ? (
            <div className="playlist-loading-state">
              <Loader2 size={36} className="animate-spin text-purple" />
              <p>{lang === 'vi' ? 'Đang tải danh sách bài hát...' : 'Loading songs...'}</p>
            </div>
          ) : songs.length === 0 ? (
            /* EMPTY PLAYLIST STATE (As requested by user!) */
            <div className="playlist-empty-state-box glass-card">
              <div className="empty-state-icon-circle">
                <Music2 size={44} className="text-purple" />
              </div>
              <h3 className="empty-state-title">
                {lang === 'vi' ? 'Playlist này chưa có bài hát nào' : 'This playlist is empty'}
              </h3>
              <p className="empty-state-desc">
                {lang === 'vi'
                  ? 'Hãy thêm những bài hát bạn yêu thích từ trang Khám phá bằng cách bấm vào biểu tượng "..." trên mỗi bài hát và chọn "Thêm vào Playlist".'
                  : 'Add songs you like from Explore by clicking "..." on any track and choosing "Add to Playlist".'}
              </p>
              <button
                type="button"
                className="btn-explore-add"
                onClick={onNavigateExplore}
              >
                <Compass size={18} />
                <span>{lang === 'vi' ? 'Khám phá bài hát ngay' : 'Explore songs now'}</span>
              </button>
            </div>
          ) : (
            /* POPULATED SONGS TABLE */
            <div className="playlist-songs-table-wrapper">
              <div className="playlist-table-header">
                <span className="th-col-num">#</span>
                <span className="th-col-song">{lang === 'vi' ? 'BÀI HÁT' : 'SONG'}</span>
                <span className="th-col-genre">{lang === 'vi' ? 'THỂ LOẠI' : 'GENRE'}</span>
                <span className="th-col-duration">
                  <Clock size={15} />
                </span>
                <span className="th-col-action">{lang === 'vi' ? 'THAO TÁC' : 'ACTION'}</span>
              </div>

              <div className="playlist-table-body">
                {songs.map((song, idx) => {
                  const isCurrent = currentSong?.id === song.id;
                  const isFav = favorites.includes(song.id);
                  const isDeleting = deletingSongId === song.id;

                  return (
                    <div
                      key={song.id}
                      className={`playlist-song-row ${isCurrent ? 'active' : ''}`}
                      onClick={() => playSong(song, songs)}
                    >
                      {/* Column 1: Index / Play status */}
                      <div className="td-col-num">
                        {isCurrent && isPlaying ? (
                          <div className="equalizer-mini">
                            <span /><span /><span />
                          </div>
                        ) : (
                          <span className="row-num">{idx + 1}</span>
                        )}
                        <div className="row-play-hover">
                          {isCurrent && isPlaying ? (
                            <Pause size={14} className="fill-white" />
                          ) : (
                            <Play size={14} className="fill-white" />
                          )}
                        </div>
                      </div>

                      {/* Column 2: Cover + Title + Artist */}
                      <div className="td-col-song">
                        <div className="row-cover-thumb">
                          {song.cover_url ? (
                            <img src={song.cover_url} alt={song.title} />
                          ) : (
                            <Music2 size={16} />
                          )}
                        </div>
                        <div className="row-song-info">
                          <span className="row-song-title">{song.title}</span>
                          <span className="row-song-artist">{song.artist}</span>
                        </div>
                      </div>

                      {/* Column 3: Mood / Genre */}
                      <div className="td-col-genre">
                        <span className="row-tag-pill">{song.genre || song.mood || 'V-Pop'}</span>
                      </div>

                      {/* Column 4: Duration */}
                      <div className="td-col-duration">
                        <span>{song.duration || '03:30'}</span>
                      </div>

                      {/* Column 5: Actions (Queue + Favorite + Remove) */}
                      <div className="td-col-action" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="row-action-btn"
                          onClick={() => addToQueue(song)}
                          title={lang === 'vi' ? 'Thêm vào danh sách phát' : 'Add to queue'}
                        >
                          <ListPlus size={16} />
                        </button>

                        <button
                          type="button"
                          className={`row-action-btn ${isFav ? 'active-fav' : ''}`}
                          onClick={() => onToggleFavorite?.(song.id)}
                          title={isFav ? 'Bỏ thích' : 'Thích bài hát'}
                        >
                          <Heart size={16} className={isFav ? 'fill-red text-red' : ''} />
                        </button>

                        {isOwner && (
                          <button
                            type="button"
                            className="row-action-btn hover-danger"
                            onClick={() => handleRemoveSong(song.id)}
                            disabled={isDeleting}
                            title={lang === 'vi' ? 'Xóa khỏi playlist này' : 'Remove from playlist'}
                          >
                            {isDeleting ? (
                              <Loader2 size={15} className="animate-spin text-red" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
