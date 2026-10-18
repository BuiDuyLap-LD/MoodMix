import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  // Trình phát nhạc
  audioQuality: '320', // '128' | '320' | 'lossless'
  autoplayNext: true,
  crossfade: 2, // seconds
  autoPlayOnStart: false,

  // Giao diện & Hiệu ứng
  enableAurora: true,
  enableCursorAura: true,
  enableClickWave: true,
  glassBlurLevel: 'standard', // 'subtle' | 'standard' | 'max'
};

export function SettingsProvider({ children }) {
  // Persisted Language ('vi' | 'en')
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem('moodmix_lang') || 'vi';
    } catch {
      return 'vi';
    }
  });

  const setLang = (newLang) => {
    setLangState(newLang);
    try {
      localStorage.setItem('moodmix_lang', newLang);
    } catch (e) {
      console.warn('Failed to save language to localStorage', e);
    }
  };

  // Persisted App Settings
  const [settings, setSettingsState] = useState(() => {
    try {
      const saved = localStorage.getItem('moodmix_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const updateSetting = (key, value) => {
    setSettingsState((prev) => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem('moodmix_settings', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save settings to localStorage', e);
      }
      return updated;
    });
  };

  // Apply glass blur variable to root
  useEffect(() => {
    const blurMap = {
      subtle: '12px',
      standard: '24px',
      max: '36px',
    };
    const val = blurMap[settings.glassBlurLevel] || '24px';
    document.documentElement.style.setProperty('--app-blur-intensity', val);
  }, [settings.glassBlurLevel]);

  return (
    <SettingsContext.Provider
      value={{
        lang,
        setLang,
        settings,
        updateSetting,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    return {
      lang: 'vi',
      setLang: () => {},
      settings: DEFAULT_SETTINGS,
      updateSetting: () => {},
    };
  }
  return ctx;
}
