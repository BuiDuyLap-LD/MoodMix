import React from 'react';
import MoodMixLogo from '../MoodMixLogo';
import { 
  Compass, Library, Music, MessagesSquare, Plus, LogIn 
} from 'lucide-react';

export default function Sidebar({
  activeNav,
  setActiveNav,
  user,
  onOpenLogin,
  onCreatePlaylist,
  lang
}) {
  const menuItems = [
    { id: 'explore', labelVi: 'Khám Phá', labelEn: 'Explore', icon: Compass },
    { id: 'library', labelVi: 'Thư Viện', labelEn: 'My Library', icon: Library },
    { id: 'new-release', labelVi: 'BXH Nhạc Mới', labelEn: 'New Releases', icon: Music },
    { id: 'community-chat', labelVi: 'Chat Cộng Đồng', labelEn: 'Community Chat', icon: MessagesSquare, badge: 'LIVE' },
  ];

  return (
    <aside className="zing-sidebar">
      {/* Brand Logo Header */}
      <div className="sidebar-brand-wrapper" onClick={() => setActiveNav('explore')}>
        <MoodMixLogo size={36} showText={true} />
        <span className="sidebar-brand-sub">MXH ÂM NHẠC TÂM TRẠNG</span>
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
              onClick={() => setActiveNav(item.id)}
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
              onClick={onOpenLogin}
            >
              <LogIn size={14} />
              <span>{lang === 'vi' ? 'ĐĂNG NHẬP' : 'SIGN IN'}</span>
            </button>
          </div>
        )}

        <button
          type="button"
          className="sidebar-create-playlist-btn"
          onClick={onCreatePlaylist}
        >
          <Plus size={18} />
          <span>{lang === 'vi' ? 'Tạo playlist mới' : 'Create playlist'}</span>
        </button>
      </div>
    </aside>
  );
}
