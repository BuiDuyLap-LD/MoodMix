import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, Music, Image as ImageIcon, CheckCircle2, AlertCircle, 
  Trash2, Play, Pause, ArrowLeft, RefreshCw, Sparkles, Database, FileAudio, LogOut, ExternalLink, ShieldCheck 
} from 'lucide-react';
import { getSongs, createSong, deleteSong, uploadMediaFile } from '../../services/musicService';
import { moodTags } from '../../data/moodTags';
import { useAudio } from '../../context/AudioContext';
import ZingPlayer from '../layout/ZingPlayer';
import InteractiveBackground from '../common/InteractiveBackground';

export default function AdminDashboard({ user, onSignOut, onViewAsUser, lang = 'vi' }) {
  const { 
    currentSong: globalSong, 
    isPlaying: isGlobalPlaying, 
    playSong: playGlobalSong, 
    togglePlay: toggleGlobalPlay, 
    pause: pauseGlobal 
  } = useAudio();

  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('V-Pop');
  const [mood, setMood] = useState('chill');
  const [isFeatured, setIsFeatured] = useState(false);
  
  // Audio File & Preview
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrlInput, setAudioUrlInput] = useState('');
  const [audioDuration, setAudioDuration] = useState('03:30');
  const [audioPreviewUrl, setAudioPreviewUrl] = useState('');
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const audioPreviewRef = useRef(null);

  // Cover Image File & Preview
  const [coverFile, setCoverFile] = useState(null);
  const [coverUrlInput, setCoverUrlInput] = useState('');
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('');

  // Fetch songs on mount
  const loadSongs = async () => {
    setIsLoading(true);
    const res = await getSongs({ mood: 'all' });
    setSongs(res.data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadSongs();
  }, []);

  // Handle local audio file selection
  const handleAudioFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(mp3|wav|m4a|aac|ogg)$/i)) {
      alert('Vui lòng chọn file âm thanh định dạng MP3, WAV, M4A.');
      return;
    }

    // Giới hạn dung lượng file audio tối đa 35MB để tránh cạn dung lượng Storage
    if (file.size > 35 * 1024 * 1024) {
      alert('Dung lượng file âm thanh vượt quá 35MB. Vui lòng chọn file nén hoặc nhẹ hơn.');
      return;
    }

    setAudioFile(file);
    const localUrl = URL.createObjectURL(file);
    setAudioPreviewUrl(localUrl);

    // Auto extract duration
    const tempAudio = new Audio(localUrl);
    tempAudio.addEventListener('loadedmetadata', () => {
      const secs = tempAudio.duration;
      if (secs && !isNaN(secs)) {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        setAudioDuration(`${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`);
      }
    });

    // Auto fill title if empty
    if (!title) {
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
      setTitle(cleanTitle);
    }
  };

  // Handle local cover image selection
  const handleCoverFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh (JPG, PNG, WebP).');
      return;
    }

    // Giới hạn dung lượng ảnh bìa tối đa 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Dung lượng ảnh bìa vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }

    setCoverFile(file);
    setCoverPreviewUrl(URL.createObjectURL(file));
  };

  // Toggle preview play/pause
  const togglePreviewPlay = () => {
    if (!audioPreviewRef.current) return;
    if (isPreviewPlaying) {
      audioPreviewRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      if (isGlobalPlaying) {
        pauseGlobal();
      }
      audioPreviewRef.current.play();
      setIsPreviewPlaying(true);
    }
  };

  // Submit Upload Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) {
      alert('Vui lòng nhập đầy đủ tên bài hát và nghệ sĩ.');
      return;
    }

    if (!audioFile && !audioUrlInput.trim()) {
      alert('Vui lòng chọn file nhạc MP3 hoặc nhập URL bài hát.');
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: 'info', text: 'Đang tải file lên Supabase Storage...' });

    try {
      let finalAudioUrl = audioUrlInput.trim();
      let finalCoverUrl = coverUrlInput.trim();

      // 1. Upload audio file if selected
      if (audioFile) {
        setMessage({ type: 'info', text: 'Đang upload file MP3 lên Storage bucket "music"...' });
        const audioUploadRes = await uploadMediaFile(audioFile, 'music', 'audio');
        finalAudioUrl = audioUploadRes.publicUrl;
      }

      // 2. Upload cover image if selected
      if (coverFile) {
        setMessage({ type: 'info', text: 'Đang upload ảnh bìa lên Storage bucket "music"...' });
        const coverUploadRes = await uploadMediaFile(coverFile, 'music', 'covers');
        finalCoverUrl = coverUploadRes.publicUrl;
      }

      // 3. Insert record into 'songs' table
      setMessage({ type: 'info', text: 'Đang lưu thông tin vào bảng "songs"...' });
      await createSong({
        title,
        artist,
        genre,
        mood,
        duration: audioDuration,
        audio_url: finalAudioUrl,
        cover_url: finalCoverUrl || null,
        is_featured: isFeatured
      });

      setMessage({ type: 'success', text: `Đã xuất bản bài hát "${title}" thành công!` });

      // Reset form
      setTitle('');
      setArtist('');
      setAudioFile(null);
      setAudioUrlInput('');
      setAudioPreviewUrl('');
      setCoverFile(null);
      setCoverUrlInput('');
      setCoverPreviewUrl('');
      setIsFeatured(false);

      // Refresh list
      loadSongs();
    } catch (err) {
      console.error('Lỗi khi upload:', err);
      setMessage({
        type: 'error',
        text: `Lỗi: ${err.message || 'Không thể upload bài hát. Hãy kiểm tra lại bucket Storage và bảng songs trên Supabase.'}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a song
  const handleDeleteSong = async (songId, songTitle) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài hát "${songTitle}"?`)) return;

    try {
      await deleteSong(songId);
      setSongs((prev) => prev.filter((s) => s.id !== songId));
      setMessage({ type: 'success', text: `Đã xóa bài hát "${songTitle}" thành công!` });
    } catch (err) {
      alert(`Xóa thất bại: ${err.message}`);
    }
  };

  return (
    <div className="admin-portal-root">
      {/* Dynamic Aurora Ambient Background & Interactive Mouse Aura */}
      <InteractiveBackground />

      {/* Top Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="admin-title-badge">
            <span className="badge-dot" />
            <span className="badge-text">MOODMIX ADMIN PORTAL</span>
          </div>

          {onViewAsUser && (
            <button type="button" className="admin-back-btn" onClick={onViewAsUser} title="Xem giao diện như người dùng">
              <ExternalLink size={15} />
              <span>{lang === 'vi' ? 'Xem Giao Diện Người Dùng' : 'Preview User View'}</span>
            </button>
          )}
        </div>

        <div className="admin-header-right">
          <div className="admin-user-pill">
            <ShieldCheck size={16} className="text-cyan" />
            <span className="admin-email-text">{user?.email || 'buil14955@gmail.com'}</span>
            <span className="admin-role-badge">Admin</span>
          </div>

          <button
            type="button"
            className="admin-logout-btn text-red"
            onClick={onSignOut}
            title={lang === 'vi' ? 'Đăng xuất khỏi Admin' : 'Sign out'}
          >
            <LogOut size={16} />
            <span>{lang === 'vi' ? 'Đăng xuất' : 'Sign out'}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main-container">
        
        {/* Banner notification */}
        {message && (
          <div className={`admin-alert-banner ${message.type}`}>
            {message.type === 'success' ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{message.text}</span>
            <button type="button" className="alert-close" onClick={() => setMessage(null)}>✕</button>
          </div>
        )}

        {/* Stats Row */}
        <section className="admin-stats-grid">
          <div className="admin-stat-card glass-card">
            <span className="stat-label">Tổng Bài Hát</span>
            <span className="stat-number">{songs.length}</span>
            <span className="stat-sub">Kho nhạc chính thức</span>
          </div>
          <div className="admin-stat-card glass-card">
            <span className="stat-label">Bài Hát Nổi Bật</span>
            <span className="stat-number">{songs.filter((s) => s.is_featured).length}</span>
            <span className="stat-sub">Hiển thị tại Spotlight</span>
          </div>
          <div className="admin-stat-card glass-card">
            <span className="stat-label">Định Dạng Âm Thanh</span>
            <span className="stat-number">MP3</span>
            <span className="stat-sub">100% Audio streaming</span>
          </div>
        </section>

        <div className="admin-workspace-split">
          
          {/* Left Column: Upload New Song Form */}
          <section className="admin-upload-card glass-card">
            <div className="card-header-bar">
              <div className="header-title-box">
                <Upload size={20} className="text-cyan" />
                <h2 className="card-heading">Tải Lên Bài Hát Mới</h2>
              </div>
              <span className="header-badge">File Thật MP3</span>
            </div>

            <form onSubmit={handleSubmit} className="admin-upload-form">
              
              {/* 1. File MP3 Upload Dropzone */}
              <div className="form-group">
                <label className="form-label">
                  <FileAudio size={16} className="text-cyan" />
                  <span>File Âm Thanh MP3 *</span>
                </label>

                <div className="dropzone-box">
                  <input
                    type="file"
                    id="audio-file-input"
                    accept=".mp3,.wav,.m4a,.aac,.ogg,audio/*"
                    onChange={handleAudioFileChange}
                    className="file-hidden-input"
                  />
                  <label htmlFor="audio-file-input" className="dropzone-inner">
                    <Upload size={28} className="dropzone-icon" />
                    {audioFile ? (
                      <div className="file-selected-info">
                        <span className="file-name">{audioFile.name}</span>
                        <span className="file-size">
                          {(audioFile.size / (1024 * 1024)).toFixed(2)} MB • Thời lượng ước tính: {audioDuration}
                        </span>
                      </div>
                    ) : (
                      <div className="dropzone-text">
                        <span className="primary-text">Bấm để chọn file MP3 hoặc kéo thả vào đây</span>
                        <span className="sub-text">Hỗ trợ định dạng .mp3, .wav, .m4a</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Audio Preview Player if file selected */}
                {audioPreviewUrl && (
                  <div className="audio-preview-widget">
                    <audio
                      ref={audioPreviewRef}
                      src={audioPreviewUrl}
                      onEnded={() => setIsPreviewPlaying(false)}
                    />
                    <button
                      type="button"
                      className="preview-play-btn"
                      onClick={togglePreviewPlay}
                    >
                      {isPreviewPlaying ? <Pause size={16} /> : <Play size={16} />}
                      <span>{isPreviewPlaying ? 'Tạm dừng nghe thử' : 'Nghe thử file MP3 vừa chọn'}</span>
                    </button>
                    <span className="preview-duration">{audioDuration}</span>
                  </div>
                )}

                {/* Or enter Direct Audio URL */}
                <div className="url-fallback-row">
                  <span className="url-label">Hoặc nhập URL file MP3 trực tiếp:</span>
                  <input
                    type="url"
                    placeholder="https://example.com/song.mp3"
                    value={audioUrlInput}
                    onChange={(e) => setAudioUrlInput(e.target.value)}
                    className="admin-text-input"
                  />
                </div>
              </div>

              {/* 2. Cover Image Upload */}
              <div className="form-group">
                <label className="form-label">
                  <ImageIcon size={16} className="text-cyan" />
                  <span>Ảnh Bìa Bài Hát (Cover Art)</span>
                </label>

                <div className="cover-picker-row">
                  <div className="cover-preview-box">
                    {coverPreviewUrl || coverUrlInput ? (
                      <img src={coverPreviewUrl || coverUrlInput} alt="Preview" className="cover-thumb-img" />
                    ) : (
                      <div className="cover-thumb-placeholder">
                        <ImageIcon size={24} className="text-muted" />
                      </div>
                    )}
                  </div>

                  <div className="cover-inputs-col">
                    <input
                      type="file"
                      id="cover-file-input"
                      accept="image/*"
                      onChange={handleCoverFileChange}
                      className="file-hidden-input"
                    />
                    <label htmlFor="cover-file-input" className="btn-choose-file">
                      Chọn ảnh từ máy
                    </label>
                    <input
                      type="url"
                      placeholder="Hoặc dán URL ảnh bìa (https://...)"
                      value={coverUrlInput}
                      onChange={(e) => setCoverUrlInput(e.target.value)}
                      className="admin-text-input"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Basic Song Meta */}
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Tên Bài Hát *</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Xin Đừng Rời Xa Anh"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="admin-text-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nghệ Sĩ / Ca Sĩ *</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Lê Gia Bảo"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="admin-text-input"
                    required
                  />
                </div>
              </div>

              {/* 4. Mood & Genre */}
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Tâm Trạng Chính (Mood) *</label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="admin-select-input"
                  >
                    {moodTags.filter((t) => t.id !== 'all' && t.id !== 'trending').map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.labelVi} ({m.labelEn})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Thể Loại Nhạc (Genre)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: V-Pop, Ballad, Lofi..."
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="admin-text-input"
                  />
                </div>
              </div>

              {/* 5. Featured Toggle */}
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="admin-checkbox"
                  />
                  <span>Đánh dấu là Bài Hát Nổi Bật (Spotlight trên trang chủ)</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`admin-submit-btn ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="btn-spinner" />
                ) : (
                  <Upload size={18} />
                )}
                <span>{isSubmitting ? 'Đang xuất bản...' : 'Xuất Bản Bài Hát Lên Kho Nhạc'}</span>
              </button>

            </form>
          </section>

          {/* Right Column: Existing Songs List in Database */}
          <section className="admin-songs-list-card glass-card">
            <div className="card-header-bar">
              <div className="header-title-box">
                <Music size={20} className="text-cyan" />
                <h2 className="card-heading">Kho Nhạc Đã Upload ({songs.length})</h2>
              </div>
              <button
                type="button"
                className="btn-refresh-list"
                onClick={loadSongs}
                title="Tải lại danh sách"
              >
                <RefreshCw size={14} className={isLoading ? 'spinning' : ''} />
                <span>Làm mới</span>
              </button>
            </div>

            <div className="songs-table-container">
              {songs.length === 0 ? (
                <div className="empty-songs-state">
                  <Music size={36} className="text-muted" />
                  <h4>Kho nhạc chưa có bài hát nào</h4>
                  <p>Hãy tải lên bài hát đầu tiên ở biểu mẫu bên trái để đưa nhạc vào hệ thống.</p>
                </div>
              ) : (
                <div className="admin-songs-table">
                  {songs.map((song, idx) => (
                    <div key={song.id} className="admin-song-row">
                      <span className="row-num">{idx + 1}</span>

                      <div className="row-cover">
                        {song.cover_url ? (
                          <img src={song.cover_url} alt={song.title} />
                        ) : (
                          <div className="row-cover-placeholder">
                            <Music size={14} />
                          </div>
                        )}
                      </div>

                      <div className="row-details">
                        <span className="row-title" title={song.title}>{song.title}</span>
                        <span className="row-artist" title={song.artist}>{song.artist}</span>
                      </div>

                      <div className="row-mood-tag">
                        <span className={`tag-pill mood-${song.mood}`}>{song.mood}</span>
                        {song.is_featured && <span className="featured-tag">★ Nổi bật</span>}
                      </div>

                      <span className="row-duration">{song.duration || '03:30'}</span>

                      <div className="row-actions">
                        <button
                          type="button"
                          className={`btn-row-action ${globalSong?.id === song.id && isGlobalPlaying ? 'text-purple' : 'text-cyan'}`}
                          onClick={() => {
                            if (globalSong?.id === song.id) {
                              toggleGlobalPlay();
                            } else {
                              playGlobalSong(song, songs);
                            }
                          }}
                          title={globalSong?.id === song.id && isGlobalPlaying ? 'Tạm dừng phát' : 'Phát bài hát này'}
                        >
                          {globalSong?.id === song.id && isGlobalPlaying ? <Pause size={16} /> : <Play size={16} />}
                        </button>

                        <button
                          type="button"
                          className="btn-row-action text-red"
                          onClick={() => handleDeleteSong(song.id, song.title)}
                          title="Xóa bài hát"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick SQL schema tip */}
            <div className="schema-tip-footer">
              <Sparkles size={14} className="text-cyan" />
              <span>Nếu gặp lỗi bảng chưa tồn tại, hãy chạy file <code>supabase/schema.sql</code> trong Supabase SQL Editor.</span>
            </div>
          </section>

        </div>

      </main>

      {/* Global Player bar active in Admin Dashboard so Admin can listen to music while managing songs */}
      {globalSong && (
        <ZingPlayer lang={lang} />
      )}
    </div>
  );
}
