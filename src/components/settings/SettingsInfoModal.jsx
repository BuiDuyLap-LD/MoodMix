import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Info,
  FileText,
  Flag,
  Megaphone,
  Phone,
  PhoneCall,
  Check,
  Copy,
  Shield,
  Sparkles,
  Send,
  PlayCircle,
  Paintbrush,
  Globe,
  Sliders,
  Volume2,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { CONTACT_AND_ADS_CONFIG } from '../../constants/contactConfig';

export default function SettingsInfoModal({ isOpen, type, onClose }) {
  const { lang, setLang, settings, updateSetting } = useSettings();
  const [copied, setCopied] = useState(false);
  const [reportForm, setReportForm] = useState({
    songName: '',
    ownerName: '',
    link: '',
    reason: '',
    email: '',
  });
  const [reportSubmitted, setReportSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleCopyEmail = (email) => {
    navigator.clipboard?.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitReport = (e) => {
    e.preventDefault();
    if (!reportForm.songName.trim() || !reportForm.email.trim()) return;

    // 1. Lưu bản ghi báo cáo vào hệ thống localStorage
    const newReport = {
      id: `dmca_${Date.now()}`,
      songName: reportForm.songName,
      ownerName: reportForm.ownerName || 'Không có',
      reason: reportForm.reason || 'Yêu cầu kiểm tra bản quyền tác giả',
      email: reportForm.email,
      createdAt: new Date().toISOString(),
      status: 'Đang thụ lý',
    };

    try {
      const existing = JSON.parse(localStorage.getItem('moodmix_copyright_reports') || '[]');
      localStorage.setItem('moodmix_copyright_reports', JSON.stringify([newReport, ...existing]));
    } catch (err) {
      console.warn('Failed to save report locally', err);
    }

    // 2. Tự động soạn sẵn email gửi trực tiếp đến hộp thư Admin
    const subject = encodeURIComponent(`[MoodMix DMCA] Báo cáo vi phạm: ${reportForm.songName}`);
    const body = encodeURIComponent(
      `Kính gửi Ban Quản Trị MoodMix,\n\n` +
      `Tôi xin gửi yêu cầu xử lý vi phạm bản quyền trên nền tảng MoodMix:\n` +
      `- Tác phẩm/Bài hát vi phạm: ${reportForm.songName}\n` +
      `- Tác giả / Chủ sở hữu quyền: ${reportForm.ownerName || 'Chưa cung cấp'}\n` +
      `- Mô tả vi phạm chi tiết: ${reportForm.reason || 'Yêu cầu gỡ bỏ theo luật sở hữu trí tuệ'}\n` +
      `- Email người báo cáo: ${reportForm.email}\n\n` +
      `Trân trọng,\n${reportForm.email}`
    );

    // Mở client email để gửi trực tiếp
    window.open(`mailto:${CONTACT_AND_ADS_CONFIG.contact.supportEmail}?subject=${subject}&body=${body}`, '_blank');

    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setReportForm({ songName: '', ownerName: '', link: '', reason: '', email: '' });
      onClose();
    }, 2500);
  };

  const modalNode = (
    <div className="settings-modal-backdrop" onClick={onClose}>
      <div
        className="settings-modal-card glass-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        {/* Nút X góc trên bên phải */}
        <button type="button" className="settings-modal-close" onClick={onClose} title={lang === 'vi' ? 'Đóng' : 'Close'}>
          <X size={18} />
        </button>

        {/* =========================================================================
            1. TRÌNH PHÁT NHẠC (PLAYER SETTINGS)
            ========================================================================= */}
        {type === 'player' && (
          <div className="settings-modal-content">
            <div className="settings-modal-header">
              <div className="settings-modal-icon-badge purple">
                <PlayCircle size={24} />
              </div>
              <div>
                <h3 className="settings-modal-title">
                  {lang === 'vi' ? 'Cài đặt Trình phát nhạc' : 'Audio Player Settings'}
                </h3>
                <span className="settings-modal-subtitle">
                  {lang === 'vi' ? 'Tùy chỉnh luồng phát nhạc & chuyển bài' : 'Playback stream and transition controls'}
                </span>
              </div>
            </div>

            <div className="settings-modal-body">
              {/* Autoplay Next */}
              <div className="settings-toggle-row">
                <div className="toggle-label-wrap">
                  <span className="toggle-title">
                    {lang === 'vi' ? 'Tự động phát tiếp' : 'Autoplay Next'}
                  </span>
                  <span className="toggle-subtitle">
                    {lang === 'vi' ? 'Tự động chuyển bài hát gợi ý khi kết thúc bài hiện tại' : 'Automatically play next song when current track ends'}
                  </span>
                </div>
                <label className="settings-switch">
                  <input
                    type="checkbox"
                    checked={settings.autoplayNext !== false}
                    onChange={(e) => updateSetting('autoplayNext', e.target.checked)}
                  />
                  <span className="slider round" />
                </label>
              </div>

              {/* Audio Quality */}
              <div className="settings-choice-group">
                <span className="choice-group-title">
                  {lang === 'vi' ? 'Chất lượng âm thanh phát trực tuyến' : 'Streaming Audio Quality'}
                </span>
                <div className="choice-pills-row">
                  <button
                    type="button"
                    className={`choice-pill ${settings.audioQuality === '128' ? 'active' : ''}`}
                    onClick={() => updateSetting('audioQuality', '128')}
                  >
                    128 kbps (Tiết kiệm)
                  </button>
                  <button
                    type="button"
                    className={`choice-pill ${settings.audioQuality === '320' ? 'active' : ''}`}
                    onClick={() => updateSetting('audioQuality', '320')}
                  >
                    320 kbps (HQ Chuẩn)
                  </button>
                  <button
                    type="button"
                    className={`choice-pill ${settings.audioQuality === 'lossless' ? 'active' : ''}`}
                    onClick={() => updateSetting('audioQuality', 'lossless')}
                  >
                    Lossless (FLAC)
                  </button>
                </div>
              </div>

              {/* Crossfade */}
              <div className="settings-choice-group">
                <span className="choice-group-title">
                  {lang === 'vi' ? 'Chuyển bài mượt mà (Crossfade)' : 'Crossfade Transition'}
                </span>
                <div className="choice-pills-row">
                  <button
                    type="button"
                    className={`choice-pill ${settings.crossfade === 0 ? 'active' : ''}`}
                    onClick={() => updateSetting('crossfade', 0)}
                  >
                    {lang === 'vi' ? 'Tắt' : 'Off'}
                  </button>
                  <button
                    type="button"
                    className={`choice-pill ${settings.crossfade === 2 ? 'active' : ''}`}
                    onClick={() => updateSetting('crossfade', 2)}
                  >
                    2 giây
                  </button>
                  <button
                    type="button"
                    className={`choice-pill ${settings.crossfade === 5 ? 'active' : ''}`}
                    onClick={() => updateSetting('crossfade', 5)}
                  >
                    5 giây
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            2. GIAO DIỆN & HIỆU ỨNG (UI & GESTURES)
            ========================================================================= */}
        {type === 'ui' && (
          <div className="settings-modal-content">
            <div className="settings-modal-header">
              <div className="settings-modal-icon-badge purple">
                <Paintbrush size={24} />
              </div>
              <div>
                <h3 className="settings-modal-title">
                  {lang === 'vi' ? 'Giao diện & Hiệu ứng cử chỉ' : 'Interface & Gesture Effects'}
                </h3>
                <span className="settings-modal-subtitle">
                  {lang === 'vi' ? 'Tùy biến ngôn ngữ, hiệu ứng cực quang và cử chỉ chuột' : 'Customize language, aurora backdrop and mouse gestures'}
                </span>
              </div>
            </div>

            <div className="settings-modal-body">
              {/* Ngôn ngữ hiển thị */}
              <div className="settings-choice-group highlight-choice">
                <div className="choice-title-icon">
                  <Globe size={16} className="text-cyan" />
                  <span className="choice-group-title">
                    {lang === 'vi' ? 'Ngôn ngữ hiển thị (Language)' : 'App Language'}
                  </span>
                </div>
                <div className="choice-pills-row">
                  <button
                    type="button"
                    className={`choice-pill ${lang === 'vi' ? 'active' : ''}`}
                    onClick={() => setLang('vi')}
                  >
                    🇻🇳 Tiếng Việt
                  </button>
                  <button
                    type="button"
                    className={`choice-pill ${lang === 'en' ? 'active' : ''}`}
                    onClick={() => setLang('en')}
                  >
                    🇬🇧 English
                  </button>
                </div>
              </div>

              {/* Nền Cực quang động */}
              <div className="settings-toggle-row">
                <div className="toggle-label-wrap">
                  <span className="toggle-title">
                    {lang === 'vi' ? 'Nền Cực quang động (Dynamic Aurora)' : 'Dynamic Aurora Backdrop'}
                  </span>
                  <span className="toggle-subtitle">
                    {lang === 'vi' ? 'Hiệu ứng ánh sáng hữu cơ biến đổi màu sắc theo cảm xúc bài hát' : 'Organic ambient blobs react to song mood in real-time'}
                  </span>
                </div>
                <label className="settings-switch">
                  <input
                    type="checkbox"
                    checked={settings.enableAurora !== false}
                    onChange={(e) => updateSetting('enableAurora', e.target.checked)}
                  />
                  <span className="slider round" />
                </label>
              </div>

              {/* Hào quang chuột */}
              <div className="settings-toggle-row">
                <div className="toggle-label-wrap">
                  <span className="toggle-title">
                    {lang === 'vi' ? 'Hào quang theo chuột (Cursor Spotlight)' : 'Cursor Spotlight'}
                  </span>
                  <span className="toggle-subtitle">
                    {lang === 'vi' ? 'Ánh sáng neon mềm chuyển động mượt mà bám theo con trỏ chuột' : 'Soft ambient spotlight following mouse gestures smoothly'}
                  </span>
                </div>
                <label className="settings-switch">
                  <input
                    type="checkbox"
                    checked={settings.enableCursorAura !== false}
                    onChange={(e) => updateSetting('enableCursorAura', e.target.checked)}
                  />
                  <span className="slider round" />
                </label>
              </div>

              {/* Sóng xung kích khi Click */}
              <div className="settings-toggle-row">
                <div className="toggle-label-wrap">
                  <span className="toggle-title">
                    {lang === 'vi' ? 'Sóng năng lượng khi Click (Click Wave)' : 'Click Gesture Ripple'}
                  </span>
                  <span className="toggle-subtitle">
                    {lang === 'vi' ? 'Làn sóng neon lan tỏa tại vị trí nhấp chuột trên màn hình' : 'Expanding ripple shockwave on mouse clicks'}
                  </span>
                </div>
                <label className="settings-switch">
                  <input
                    type="checkbox"
                    checked={settings.enableClickWave !== false}
                    onChange={(e) => updateSetting('enableClickWave', e.target.checked)}
                  />
                  <span className="slider round" />
                </label>
              </div>

              {/* Độ mờ kính */}
              <div className="settings-choice-group">
                <span className="choice-group-title">
                  {lang === 'vi' ? 'Độ mờ kính thủy tinh (Glassmorphism Blur)' : 'Glass Blur Level'}
                </span>
                <div className="choice-pills-row">
                  <button
                    type="button"
                    className={`choice-pill ${settings.glassBlurLevel === 'subtle' ? 'active' : ''}`}
                    onClick={() => updateSetting('glassBlurLevel', 'subtle')}
                  >
                    {lang === 'vi' ? 'Nhẹ (12px)' : 'Subtle'}
                  </button>
                  <button
                    type="button"
                    className={`choice-pill ${settings.glassBlurLevel === 'standard' ? 'active' : ''}`}
                    onClick={() => updateSetting('glassBlurLevel', 'standard')}
                  >
                    {lang === 'vi' ? 'Tiêu chuẩn (24px)' : 'Standard'}
                  </button>
                  <button
                    type="button"
                    className={`choice-pill ${settings.glassBlurLevel === 'max' ? 'active' : ''}`}
                    onClick={() => updateSetting('glassBlurLevel', 'max')}
                  >
                    {lang === 'vi' ? 'Sâu (36px)' : 'Deep'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            3. GIỚI THIỆU (ABOUT)
            ========================================================================= */}
        {type === 'about' && (
          <div className="settings-modal-content">
            <div className="settings-modal-header">
              <div className="settings-modal-icon-badge purple">
                <Info size={24} />
              </div>
              <div>
                <h3 className="settings-modal-title">
                  {lang === 'vi' ? 'Về chúng tôi • MoodMix' : 'About MoodMix'}
                </h3>
                <span className="settings-modal-subtitle">
                  {lang === 'vi' ? 'Phiên bản v2.5.0 Zing-Fusion Edition' : 'Version v2.5.0 Zing-Fusion'}
                </span>
              </div>
            </div>

            <div className="settings-modal-body">
              <p className="settings-text-desc">
                {lang === 'vi'
                  ? 'MoodMix là nền tảng streaming âm nhạc cá nhân hóa thế hệ mới. Ứng dụng kết hợp giữa phân loại tâm trạng âm nhạc, hiệu ứng cực quang không gian tương tác cử chỉ và kênh kết nối cộng đồng người nghe theo thời gian thực.'
                  : 'MoodMix is a next-generation personalized music streaming platform that fuses mood-based music tagging, dynamic aurora mesh visuals, and a real-time community chat network.'}
              </p>

              <div className="settings-highlight-grid">
                <div className="settings-highlight-item">
                  <Sparkles size={18} className="text-purple" />
                  <div>
                    <h4>{lang === 'vi' ? 'Trải Nghiệm Cảm Xúc' : 'Mood Personalization'}</h4>
                    <p>{lang === 'vi' ? 'Chill, Vui vẻ, Buồn, Lãng mạn, Tập trung' : 'Chill, Happy, Melancholic, Romantic, Focus'}</p>
                  </div>
                </div>

                <div className="settings-highlight-item">
                  <Shield size={18} className="text-cyan" />
                  <div>
                    <h4>{lang === 'vi' ? 'Bảo Mật Đa Tầng' : 'Enterprise Security'}</h4>
                    <p>{lang === 'vi' ? 'PostgreSQL Row Level Security & Google OAuth' : 'Secured via Supabase Auth & PostgreSQL RLS'}</p>
                  </div>
                </div>
              </div>

              <div className="settings-meta-footer">
                <span>© 2026 MoodMix Music Inc. All rights reserved.</span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            4. ĐIỀU KHOẢN SỬ DỤNG (TERMS)
            ========================================================================= */}
        {type === 'terms' && (
          <div className="settings-modal-content">
            <div className="settings-modal-header">
              <div className="settings-modal-icon-badge blue">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="settings-modal-title">
                  {lang === 'vi' ? 'Điều khoản sử dụng MoodMix' : 'Terms of Service'}
                </h3>
                <span className="settings-modal-subtitle">
                  {lang === 'vi' ? 'Cập nhật lần cuối: Tháng 10/2026' : 'Last updated: October 2026'}
                </span>
              </div>
            </div>

            <div className="settings-modal-body terms-scroll-view">
              <section className="terms-section">
                <h4>1. {lang === 'vi' ? 'Quy định tài khoản và quyền riêng tư' : 'Account & Privacy'}</h4>
                <p>
                  {lang === 'vi'
                    ? 'Người dùng sử dụng tài khoản Google để xác thực an toàn. MoodMix cam kết không chia sẻ dữ liệu cá nhân hay lịch sử nghe nhạc cho bên thứ ba.'
                    : 'Users authenticate securely using Google OAuth. MoodMix strictly does not disclose personal logs or playlists to third parties.'}
                </p>
              </section>

              <section className="terms-section">
                <h4>2. {lang === 'vi' ? 'Bản quyền & Sử dụng âm nhạc' : 'Copyright & Fair Use'}</h4>
                <p>
                  {lang === 'vi'
                    ? 'Các bài hát và hình ảnh bìa album trên nền tảng được quản lý nghiêm ngặt bởi ban quản trị và các tác giả được cấp phép. Nghiêm cấm mọi hành vi trích xuất bản quyền trái phép.'
                    : 'Songs and artworks uploaded are curated under fair use and authorized administration. Unauthorized mass downloading or scraping is prohibited.'}
                </p>
              </section>

              <section className="terms-section">
                <h4>3. {lang === 'vi' ? 'Văn hóa cộng đồng (Chat)' : 'Community Guidelines'}</h4>
                <p>
                  {lang === 'vi'
                    ? 'Người tham gia phòng Chat Cộng Đồng phải giữ lịch sự, không spam tin nhắn, không chia sẻ liên kết độc hại hoặc ngôn từ kích động.'
                    : 'All users inside Community Chat must remain courteous, avoid spamming, and never post malicious links or abusive text.'}
                </p>
              </section>
            </div>
          </div>
        )}

        {/* =========================================================================
            5. BÁO CÁO VI PHẠM BẢN QUYỀN (COPYRIGHT)
            ========================================================================= */}
        {type === 'copyright' && (
          <div className="settings-modal-content">
            <div className="settings-modal-header">
              <div className="settings-modal-icon-badge red">
                <Flag size={24} />
              </div>
              <div>
                <h3 className="settings-modal-title">
                  {lang === 'vi' ? 'Báo cáo vi phạm bản quyền (DMCA)' : 'Report Copyright Infringement'}
                </h3>
                <span className="settings-modal-subtitle">
                  {lang === 'vi' ? 'Bộ phận Bản quyền MoodMix sẽ xử lý trong 24h' : 'Our Copyright Team reviews reports within 24h'}
                </span>
              </div>
            </div>

            <div className="settings-modal-body">
              {reportSubmitted ? (
                <div className="report-success-state">
                  <div className="report-success-icon">
                    <Check size={32} />
                  </div>
                  <h4>{lang === 'vi' ? 'Đã tiếp nhận báo cáo!' : 'Report Received!'}</h4>
                  <p>
                    {lang === 'vi'
                      ? 'Cảm ơn bạn. Đội ngũ kiểm duyệt bản quyền MoodMix sẽ kiểm tra và phản hồi qua email của bạn.'
                      : 'Thank you. MoodMix review team will verify the track and follow up via email.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} className="settings-report-form">
                  <div className="form-group">
                    <label>{lang === 'vi' ? 'Tên bài hát / Nội dung vi phạm *' : 'Song Title / Infringing Work *'}</label>
                    <input
                      type="text"
                      required
                      placeholder={lang === 'vi' ? 'Ví dụ: Thuyền Quyên...' : 'e.g. Song Title...'}
                      value={reportForm.songName}
                      onChange={(e) => setReportForm({ ...reportForm, songName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>{lang === 'vi' ? 'Tên tác giả / Chủ sở hữu quyền tác giả' : 'Author / Rights Owner'}</label>
                    <input
                      type="text"
                      placeholder={lang === 'vi' ? 'Hãng thu âm / Nhạc sĩ' : 'Record Label / Artist'}
                      value={reportForm.ownerName}
                      onChange={(e) => setReportForm({ ...reportForm, ownerName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>{lang === 'vi' ? 'Lý do & Mô tả vi phạm' : 'Details / Reason'}</label>
                    <textarea
                      rows="3"
                      placeholder={lang === 'vi' ? 'Mô tả chi tiết vi phạm bản quyền...' : 'Provide details regarding the violation...'}
                      value={reportForm.reason}
                      onChange={(e) => setReportForm({ ...reportForm, reason: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>{lang === 'vi' ? 'Email liên hệ của bạn *' : 'Your Contact Email *'}</label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={reportForm.email}
                      onChange={(e) => setReportForm({ ...reportForm, email: e.target.value })}
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-submit-report">
                      <Send size={15} />
                      <span>{lang === 'vi' ? 'Gửi báo cáo' : 'Submit Report'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            6. QUẢNG CÁO (ADS / SPONSORSHIP)
            ========================================================================= */}
        {type === 'ads' && (
          <div className="settings-modal-content">
            <div className="settings-modal-header">
              <div className="settings-modal-icon-badge yellow">
                <Megaphone size={24} />
              </div>
              <div>
                <h3 className="settings-modal-title">
                  {lang === 'vi' ? 'Hợp tác Truyền thông & Quảng cáo' : 'Advertising & Sponsorship'}
                </h3>
                <span className="settings-modal-subtitle">
                  {lang === 'vi' ? 'Tiếp cận hàng ngàn người nghe nhạc mỗi ngày' : 'Reach thousands of daily music lovers'}
                </span>
              </div>
            </div>

            <div className="settings-modal-body">
              <p className="settings-text-desc">
                {lang === 'vi' ? CONTACT_AND_ADS_CONFIG.ads.introVi : CONTACT_AND_ADS_CONFIG.ads.introEn}
              </p>

              <div className="ads-packages-grid">
                {CONTACT_AND_ADS_CONFIG.ads.packages.map((pkg, idx) => (
                  <div key={idx} className="ads-pkg-card">
                    <h4>{pkg.title}</h4>
                    <p>{lang === 'vi' ? pkg.descVi : pkg.descEn}</p>
                  </div>
                ))}
              </div>

              <div className="ads-contact-box">
                <p>{lang === 'vi' ? 'Liên hệ bộ phận Booking Quảng Cáo:' : 'Contact our Ads Partnership Desk:'}</p>
                <div className="contact-row">
                  <strong>{CONTACT_AND_ADS_CONFIG.ads.bookingEmail}</strong>
                  <div className="contact-btn-group">
                    <button
                      type="button"
                      className="copy-btn"
                      onClick={() => handleCopyEmail(CONTACT_AND_ADS_CONFIG.ads.bookingEmail)}
                    >
                      {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                      <span>{copied ? (lang === 'vi' ? 'Đã sao chép' : 'Copied') : (lang === 'vi' ? 'Sao chép' : 'Copy')}</span>
                    </button>
                    <a
                      href={`mailto:${CONTACT_AND_ADS_CONFIG.ads.bookingEmail}?subject=[MoodMix%20Booking]%20Lien%20he%20hop%20tac`}
                      className="copy-btn direct-action-btn"
                    >
                      <Send size={13} />
                      <span>{lang === 'vi' ? 'Soạn email' : 'Compose Email'}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            7. LIÊN HỆ (CONTACT)
            ========================================================================= */}
        {type === 'contact' && (
          <div className="settings-modal-content">
            <div className="settings-modal-header">
              <div className="settings-modal-icon-badge green">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="settings-modal-title">
                  {lang === 'vi' ? 'Liên hệ & Hỗ trợ Kỹ thuật' : 'Contact & Support'}
                </h3>
                <span className="settings-modal-subtitle">
                  {lang === 'vi' ? 'Đội ngũ MoodMix luôn sẵn sàng hỗ trợ 24/7' : 'MoodMix Support is available 24/7'}
                </span>
              </div>
            </div>

            <div className="settings-modal-body">
              <div className="contact-info-list">
                <div className="contact-info-item">
                  <div className="contact-item-label">{lang === 'vi' ? 'Tổng đài hỗ trợ:' : 'Hotline:'}</div>
                  <div className="contact-item-value">
                    <span>{CONTACT_AND_ADS_CONFIG.contact.hotline}</span>
                    <a
                      href={`tel:${CONTACT_AND_ADS_CONFIG.contact.hotline}`}
                      className="copy-btn direct-action-btn"
                      title={lang === 'vi' ? 'Bấm để gọi điện' : 'Click to call'}
                    >
                      <PhoneCall size={13} />
                      <span>{lang === 'vi' ? 'Gọi ngay' : 'Call'}</span>
                    </a>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-item-label">{lang === 'vi' ? 'Email hỗ trợ kỹ thuật:' : 'Support Email:'}</div>
                  <div className="contact-item-value">
                    <span>{CONTACT_AND_ADS_CONFIG.contact.supportEmail}</span>
                    <div className="contact-btn-group">
                      <button
                        type="button"
                        className="copy-btn"
                        onClick={() => handleCopyEmail(CONTACT_AND_ADS_CONFIG.contact.supportEmail)}
                      >
                        {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                        <span>{copied ? (lang === 'vi' ? 'Đã sao chép' : 'Copied') : (lang === 'vi' ? 'Sao chép' : 'Copy')}</span>
                      </button>
                      <a
                        href={`mailto:${CONTACT_AND_ADS_CONFIG.contact.supportEmail}?subject=[MoodMix%20Support]%20Yeu%20cau%20ho%20tro`}
                        className="copy-btn direct-action-btn"
                      >
                        <Send size={13} />
                        <span>{lang === 'vi' ? 'Gửi mail' : 'Email'}</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-item-label">{lang === 'vi' ? 'Kênh Telegram cộng đồng:' : 'Telegram Channel:'}</div>
                  <div className="contact-item-value">{CONTACT_AND_ADS_CONFIG.contact.telegram}</div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-item-label">{lang === 'vi' ? 'Địa chỉ văn phòng:' : 'Headquarters:'}</div>
                  <div className="contact-item-value">{CONTACT_AND_ADS_CONFIG.contact.address}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nút Đóng ở cuối chức năng (Footer Close Button) */}
        <div className="settings-modal-footer">
          <button
            type="button"
            className="settings-modal-bottom-close-btn"
            onClick={onClose}
          >
            {lang === 'vi' ? 'Đóng' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
}
