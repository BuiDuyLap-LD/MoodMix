import React from 'react';
import MoodMixLogo from '../MoodMixLogo';
import { 
  Compass, Library, Music, MessagesSquare, Plus, LogIn, X 
} from 'lucide-react';

export default function Sidebar({
  activeNav,
  setActiveNav,
  user,
  onOpenLogin,
  onCreatePlaylist,
  lang,
  isMobileOpen = false,
  onClose,
}) {
  const menuItems = [
    { id: 'explore', labelVi: 'Khám Phá', labelEn: 'Explore', icon: Compass },
    { id: 'library', labelVi: 'Thư Viện', labelEn: 'My Library', icon: Library },
    { id: 'new-release', labelVi: 'BXH Nhạc Mới', labelEn: 'New Releases', icon: Music },
    { id: 'community-chat', labelVi: 'Chat Cộng Đồng', labelEn: 'Community Chat', icon: MessagesSquare, badge: 'LIVE' },
  ];

  const handleNavClick = (id) => {
    setActiveNav(id);
    onClose?.();
  };

  const handleLoginClick = () => {
    onOpenLogin?.();
    onClose?.();
  };

  const handleCreatePlaylistClick = () => {
    onCreatePlaylist?.();
    onClose?.();
  };

  return (
    <>
      {/* Mobile Drawer Dimmer Backdrop */}
      {isMobileOpen && (
        <div 
          className="sidebar-mobile-backdrop" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`zing-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Logo Header */}
        <div className="sidebar-brand-wrapper">
          <div 
            className="sidebar-brand-clickable" 
            onClick={() => handleNavClick('explore')}
            role="button"
            tabIndex={0}
          >
            <MoodMixLogo size={36} showText={true} />
            <span className="sidebar-brand-sub">MXH ÂM NHẠC TÂM TRẠNG</span>
          </div>

          {/* Close button on mobile drawer */}
          <button
            type="button"
            className="sidebar-mobile-close-btn"
            onClick={onClose}
            title={lang === 'vi' ? 'Đóng menu' : 'Close menu'}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main Navigation Menu */}
        <nav className="sidebar-nav-group">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon size={20} className="nav-item-icon" />
                <span className="nav-item-label">{lang === 'vi' ? item.labelVi : item.labelEn}</span>
                {item.badge && <span className="nav-item-badge">{item.badge}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-divider" />

        {/* Bottom Sticky Area */}
        <div className="sidebar-bottom-area">
          {!user && (
            <div className="sidebar-login-banner">
              <p className="login-banner-text">
                {lang === 'vi' 
                  ? 'Đăng nhập để khám phá playlist dành riêng cho bạn' 
                  : 'Sign in to discover personalized playlists'}
              </p>
              <button
                type="button"
                className="sidebar-login-btn"
                onClick={handleLoginClick}
              >
                <LogIn size={14} />
                <span>{lang === 'vi' ? 'ĐĂNG NHẬP' : 'SIGN IN'}</span>
              </button>
            </div>
          )}

          <button
            type="button"
            className="sidebar-create-playlist-btn"
            onClick={handleCreatePlaylistClick}
          >
            <Plus size={18} />
            <span>{lang === 'vi' ? 'Tạo playlist mới' : 'Create playlist'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
