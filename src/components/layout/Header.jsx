import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, ArrowRight, Search, Globe, LogOut, User as UserIcon, 
  Play, Pause, Music2, TrendingUp, Sparkles, Menu 
} from 'lucide-react';
import MoodMixLogo from '../MoodMixLogo';
import { removeVietnameseTones } from '../../services/musicService';
import SettingsDropdown from '../settings/SettingsDropdown';

export default function Header({
  searchQuery,
  setSearchQuery,
  songs = [],
  currentSong,
  isPlaying,
  onPlaySong,
  lang,
  setLang,
  user,
  onOpenLogin,
  onSignOut,
  onToggleSidebar,
  isSidebarOpen = false,
  onNavigateHome,
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchBoxRef = useRef(null);

  const userDisplayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userAvatar = user?.user_metadata?.avatar_url;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter live matching songs for the instant dropdown
  const instantMatches = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return [];
    const q = removeVietnameseTones(searchQuery);
    return songs
      .filter((s) => {
        const titleNorm = removeVietnameseTones(s.title);
        const artistNorm = removeVietnameseTones(s.artist);
        const genreNorm = removeVietnameseTones(s.genre);
        return titleNorm.includes(q) || artistNorm.includes(q) || genreNorm.includes(q);
      })
      .slice(0, 5);
  }, [searchQuery, songs]);

  // Suggested quick tags derived dynamically from real Supabase songs
  const popularTags = useMemo(() => {
    if (!songs || songs.length === 0) return ['Chill', 'V-Pop', 'Remix'];
    const tags = new Set();
    songs.slice(0, 10).forEach((s) => {
      if (s.title) tags.add(s.title);
      if (s.artist) tags.add(s.artist);
    });
    return Array.from(tags).slice(0, 6);
  }, [songs]);

  const handleSelectSong = (song) => {
    if (onPlaySong) {
      onPlaySong(song, songs);
    }
    setIsSearchFocused(false);
  };

  const handleSelectTag = (tag) => {
    setSearchQuery(tag);
  };

  return (
    <header className="zing-header">
      <div className="header-left-group">
        {/* Mobile Navigation Menu Toggle */}
        <button
          type="button"
          className="mobile-menu-toggle-btn"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? (lang === 'vi' ? 'Đóng menu' : 'Close menu') : (lang === 'vi' ? 'Mở menu' : 'Open menu')}
          title={isSidebarOpen ? (lang === 'vi' ? 'Đóng menu' : 'Close menu') : (lang === 'vi' ? 'Mở menu' : 'Open menu')}
        >
          <Menu size={20} />
        </button>

        {/* Mobile Header Brand Logo */}
        <div 
          className="mobile-header-brand" 
          onClick={() => onNavigateHome?.()}
          role="button"
          tabIndex={0}
          title="MoodMix"
        >
          <MoodMixLogo size={28} showText={true} />
        </div>

        {/* Navigation Arrows (Desktop) */}
        <div className="nav-arrows-group">
          <button type="button" className="nav-arrow-btn" disabled title="Quay lại">
            <ArrowLeft size={18} />
          </button>
          <button type="button" className="nav-arrow-btn" disabled title="Tiến tới">
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Global Search Bar with Instant Dropdown */}
        <div className="header-search-box-container" ref={searchBoxRef}>
          <div className={`header-search-box ${isSearchFocused ? 'focused' : ''}`}>
            <Search size={18} className="search-box-icon" />
            <input
              type="text"
              placeholder={
                lang === 'vi'
                  ? 'Tìm bài hát, nghệ sĩ...'
                  : 'Search songs, artists...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="search-box-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-cross"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>

          {/* Instant Dropdown Suggestions (Zing MP3 Style) */}
          {isSearchFocused && (
            <div className="header-search-dropdown glass-card">
              {searchQuery && searchQuery.trim() ? (
                /* Matches for typed query */
                <div className="search-dropdown-content">
                  <div className="dropdown-section-header">
                    <Sparkles size={13} className="text-purple" />
                    <span>
                      {lang === 'vi' ? 'Gợi ý kết quả cho' : 'Suggestions for'} "{searchQuery}"
                    </span>
                  </div>

                  {instantMatches.length > 0 ? (
                    <div className="dropdown-song-list">
                      {instantMatches.map((song) => {
                        const isCurrentPlaying =
                          currentSong?.id === song.id && isPlaying;

                        return (
                          <div
                            key={song.id}
                            className={`dropdown-song-item ${isCurrentPlaying ? 'active' : ''}`}
                            onClick={() => handleSelectSong(song)}
                          >
                            <div className="dropdown-song-cover">
                              {song.cover_url ? (
                                <img src={song.cover_url} alt={song.title} />
                              ) : (
                                <div className="dropdown-song-fallback">
                                  <Music2 size={14} />
                                </div>
                              )}
                              <div className="dropdown-play-hint">
                                {isCurrentPlaying ? (
                                  <Pause size={12} className="fill-white" />
                                ) : (
                                  <Play size={12} className="fill-white translate-x-0.5" />
                                )}
                              </div>
                            </div>

                            <div className="dropdown-song-info">
                              <h5 className="dropdown-song-title" title={song.title}>
                                {song.title}
                              </h5>
                              <p className="dropdown-song-artist">{song.artist}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="dropdown-no-result">
                      <p>
                        {lang === 'vi'
                          ? 'Không tìm thấy bài hát nào khớp gợi ý.'
                          : 'No matching quick suggestions.'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Popular search suggestions when search input is empty */
                <div className="search-dropdown-content">
                  <div className="dropdown-section-header">
                    <TrendingUp size={13} className="text-yellow-400" />
                    <span>{lang === 'vi' ? 'Tìm kiếm phổ biến' : 'Popular Searches'}</span>
                  </div>

                  <div className="dropdown-tags-wrap">
                    {popularTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className="dropdown-tag-pill"
                        onClick={() => handleSelectTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="header-right-group">
        {/* Settings Dropdown (replaces language switcher & contains language settings) */}
        <SettingsDropdown />

        {/* User Account / Profile */}
        {user ? (
          <div className="profile-dropdown-anchor">
            <button
              type="button"
              className="profile-avatar-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              title={userDisplayName}
            >
              {userAvatar ? (
                <img src={userAvatar} alt={userDisplayName} className="header-avatar-img" />
              ) : (
                <div className="header-avatar-circle">
                  <UserIcon size={18} />
                </div>
              )}
            </button>

            {showProfileMenu && (
              <div className="header-profile-menu glass-card">
                <div className="profile-menu-info">
                  <p className="profile-menu-name">{userDisplayName}</p>
                  <p className="profile-menu-email">{user?.email}</p>
                  <span className="profile-role-tag">Member</span>
                </div>
                <div className="profile-menu-hr" />
                <button
                  type="button"
                  className="profile-logout-item text-red"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onSignOut();
                  }}
                >
                  <LogOut size={16} />
                  <span>{lang === 'vi' ? 'Đăng xuất' : 'Sign out'}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="header-login-btn"
            onClick={onOpenLogin}
          >
            {lang === 'vi' ? 'Đăng nhập' : 'Sign In'}
          </button>
        )}
      </div>
    </header>
  );
}
