import React, { useState, useEffect } from 'react';
import AudioWaveVisualizer from './components/AudioWaveVisualizer';
import MoodMixLogo from './components/MoodMixLogo';
import GoogleIcon from './components/GoogleIcon';
import InfoModal from './components/InfoModal';
import UserDashboard from './components/user/UserDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import { translations } from './i18n/translations';
import { signInWithGoogle, isSupabaseConfigured, supabase, signOut } from './lib/supabase';
import { Sparkles, Globe, Zap, ArrowLeft, X, Shield, ArrowRight } from 'lucide-react';
import { useSettings } from './context/SettingsContext';

// Email duy nhất được cấp quyền Quản trị viên (Admin)
const ADMIN_EMAIL = 'buil14955@gmail.com';

export default function App() {
  const { lang, setLang } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [adminPreviewUser, setAdminPreviewUser] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, type: 'info', title: '' });
  const [currentUser, setCurrentUser] = useState(null);

  const t = translations[lang];

  // Kiểm tra tài khoản có phải Admin không
  const isAdmin = currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // Listen to Supabase auth state
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // Get current session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setCurrentUser(session.user);
        }
      });

      // Subscribe to auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setCurrentUser(session?.user ?? null);
        if (session?.user) {
          setIsLoginModalOpen(false);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const res = await signInWithGoogle();
    setIsLoading(false);

    if (!res.success) {
      console.error('Login failed:', res.error || res.message);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setCurrentUser(null);
    setAdminPreviewUser(false);
  };

  const openTerms = () => {
    setModalState({
      isOpen: true,
      type: 'terms',
      title: t.termsModalTitle,
    });
  };

  const openPrivacy = () => {
    setModalState({
      isOpen: true,
      type: 'privacy',
      title: t.privacyModalTitle,
    });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: 'info', title: '' });
  };

  // 1. NẾU LÀ ADMIN VÀ KHÔNG Ở CHẾ ĐỘ XEM TRƯỚC USER: Render trực tiếp Trang Quản Trị (Admin Portal)
  if (isAdmin && !adminPreviewUser) {
    return (
      <AdminDashboard
        user={currentUser}
        onSignOut={handleSignOut}
        onViewAsUser={() => setAdminPreviewUser(true)}
        lang={lang}
      />
    );
  }

  // 2. NẾU LÀ USER THƯỜNG (HOẶC ADMIN ĐANG XEM TRƯỚC GIAO DIỆN USER):
  return (
    <>
      {/* Floating Banner thông báo nếu Admin đang trong chế độ kiểm tra giao diện User */}
      {isAdmin && adminPreviewUser && (
        <aside className="admin-testing-banner">
          <div className="banner-left">
            <Shield size={16} className="text-cyan" />
            <span>Đang kiểm tra tính tương thích giao diện User với tài khoản Admin ({currentUser.email})</span>
          </div>
          <button
            type="button"
            className="btn-return-admin"
            onClick={() => setAdminPreviewUser(false)}
          >
            <span>Quay lại Admin Dashboard</span>
            <ArrowRight size={14} />
          </button>
        </aside>
      )}

      {/* Main Zing MP3-Style User Interface (Hoàn toàn không có nút Admin cho người dùng thường) */}
      <UserDashboard
        user={currentUser}
        lang={lang}
        setLang={setLang}
        onSignOut={handleSignOut}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Google OAuth Login Modal (Dành cho khách bấm đăng nhập) */}
      {isLoginModalOpen && (
        <div className="login-modal-overlay" onClick={() => setIsLoginModalOpen(false)}>
          <div 
            className="login-modal-card-wrapper" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button" 
              className="login-modal-close-btn"
              onClick={() => setIsLoginModalOpen(false)}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Reusing design login portal card */}
            <div className="auth-portal-card glass-card modal-auth-version">
              <div className="auth-card-inner">
                {/* Brand Header */}
                <div className="brand-header-area">
                  <MoodMixLogo size={48} showText={true} />
                </div>

                {/* Headings */}
                <div className="auth-headings">
                  <h2 className="auth-title">{t.loginTitle}</h2>
                  <p className="auth-subtitle">{t.loginSubtitle}</p>
                </div>

                {/* Google Sign-In Action */}
                <div className="auth-action-area">
                  <button
                    type="button"
                    id="google-login-btn"
                    className={`google-sign-in-btn ${isLoading ? 'loading' : ''}`}
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="btn-spinner" />
                    ) : (
                      <GoogleIcon size={20} className="google-btn-icon" />
                    )}
                    <span className="google-btn-label">
                      {isLoading ? t.signingIn : t.continueWithGoogle}
                    </span>
                  </button>
                </div>

                {/* Legal Links */}
                <footer className="auth-footer-links">
                  <button type="button" className="legal-link" onClick={openTerms}>
                    {t.termsOfService}
                  </button>
                  <span className="legal-divider"></span>
                  <button type="button" className="legal-link" onClick={openPrivacy}>
                    {t.privacyPolicy}
                  </button>
                </footer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal for Terms and Privacy */}
      <InfoModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        type={modalState.type}
      >
        {modalState.type === 'terms' && (
          <div className="policy-modal-body">
            {t.termsContent.map((paragraph, idx) => (
              <p key={idx} className="policy-paragraph">{paragraph}</p>
            ))}
          </div>
        )}

        {modalState.type === 'privacy' && (
          <div className="policy-modal-body">
            {t.privacyContent.map((paragraph, idx) => (
              <p key={idx} className="policy-paragraph">{paragraph}</p>
            ))}
          </div>
        )}
      </InfoModal>
    </>
  );
}
