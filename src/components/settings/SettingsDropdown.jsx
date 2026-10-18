import React, { useState, useRef, useEffect } from 'react';
import {
  Settings,
  PlayCircle,
  Paintbrush,
  Info,
  FileText,
  Flag,
  Megaphone,
  Phone,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import SettingsInfoModal from './SettingsInfoModal';

export default function SettingsDropdown() {
  const { lang } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'player' | 'ui' | 'about' | 'terms' | 'copyright' | 'ads' | 'contact'
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenModal = (type) => {
    setModalType(type);
    setIsOpen(false);
  };

  return (
    <div className="settings-container-anchor" ref={dropdownRef}>
      {/* Settings Trigger Icon Button (Replaces language switcher) */}
      <button
        type="button"
        className={`header-settings-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={lang === 'vi' ? 'Cài đặt MoodMix' : 'MoodMix Settings'}
        aria-label="Settings"
      >
        <Settings size={18} className="settings-gear-icon" />
      </button>

      {/* Settings Dropdown Popover */}
      {isOpen && (
        <div className="settings-dropdown-menu">
          <div className="settings-menu-list">
            {/* 1. Trình phát nhạc */}
            <button
              type="button"
              className="settings-menu-item"
              onClick={() => handleOpenModal('player')}
            >
              <div className="settings-item-left">
                <PlayCircle size={18} className="settings-icon" />
                <span>{lang === 'vi' ? 'Trình phát nhạc' : 'Audio Player'}</span>
              </div>
              <ChevronRight size={16} className="settings-chevron" />
            </button>

            {/* 2. Giao diện */}
            <button
              type="button"
              className="settings-menu-item"
              onClick={() => handleOpenModal('ui')}
            >
              <div className="settings-item-left">
                <Paintbrush size={18} className="settings-icon" />
                <span>{lang === 'vi' ? 'Giao diện' : 'Interface & Theme'}</span>
              </div>
              <ChevronRight size={16} className="settings-chevron" />
            </button>

            {/* Divider Line */}
            <div className="settings-menu-divider" />

            {/* 3. Giới thiệu */}
            <button
              type="button"
              className="settings-menu-item"
              onClick={() => handleOpenModal('about')}
            >
              <div className="settings-item-left">
                <Info size={18} className="settings-icon" />
                <span>{lang === 'vi' ? 'Giới thiệu' : 'About Us'}</span>
              </div>
            </button>

            {/* 4. Điều khoản sử dụng */}
            <button
              type="button"
              className="settings-menu-item"
              onClick={() => handleOpenModal('terms')}
            >
              <div className="settings-item-left">
                <FileText size={18} className="settings-icon" />
                <span>{lang === 'vi' ? 'Điều khoản sử dụng' : 'Terms of Service'}</span>
              </div>
              <ChevronRight size={16} className="settings-chevron" />
            </button>

            {/* 5. Báo cáo vi phạm bản quyền */}
            <button
              type="button"
              className="settings-menu-item"
              onClick={() => handleOpenModal('copyright')}
            >
              <div className="settings-item-left">
                <Flag size={18} className="settings-icon" />
                <span>{lang === 'vi' ? 'Báo cáo vi phạm bản quyền' : 'Copyright Infringement'}</span>
              </div>
              <ExternalLink size={15} className="settings-external" />
            </button>

            {/* 6. Quảng cáo */}
            <button
              type="button"
              className="settings-menu-item"
              onClick={() => handleOpenModal('ads')}
            >
              <div className="settings-item-left">
                <Megaphone size={18} className="settings-icon" />
                <span>{lang === 'vi' ? 'Quảng cáo' : 'Advertising'}</span>
              </div>
              <ExternalLink size={15} className="settings-external" />
            </button>

            {/* 7. Liên hệ */}
            <button
              type="button"
              className="settings-menu-item"
              onClick={() => handleOpenModal('contact')}
            >
              <div className="settings-item-left">
                <Phone size={18} className="settings-icon" />
                <span>{lang === 'vi' ? 'Liên hệ' : 'Contact Support'}</span>
              </div>
              <ExternalLink size={15} className="settings-external" />
            </button>
          </div>
        </div>
      )}

      {/* Centered Modal for All Functions (via React Portal to document.body) */}
      <SettingsInfoModal
        isOpen={Boolean(modalType)}
        type={modalType}
        onClose={() => setModalType(null)}
      />
    </div>
  );
}
