import React from 'react';

export default function MoodMixLogo({ size = 44, showText = true, className = '' }) {
  return (
    <div className={`moodmix-logo-container ${className}`}>
      <div 
        className="moodmix-logo-badge"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <svg
          viewBox="0 0 100 100"
          className="moodmix-logo-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#080e1a" />
            </linearGradient>
            
            <linearGradient id="neonWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>

            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Rounded base badge */}
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="24"
            fill="url(#logoBgGrad)"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="3"
          />

          {/* Glowing musical curve with 'mood' & notes */}
          <path
            d="M26 62 C32 62, 34 50, 42 50 C50 50, 52 64, 60 64 C68 64, 70 42, 78 38"
            fill="none"
            stroke="url(#neonWaveGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            filter="url(#glowFilter)"
          />

          {/* Musical Notes connected */}
          <circle cx="28" cy="62" r="6" fill="#a855f7" filter="url(#glowFilter)" />
          <circle cx="74" cy="40" r="6.5" fill="#06b6d4" filter="url(#glowFilter)" />

          {/* Tiny stylized 'mood' tag */}
          <text
            x="50"
            y="76"
            textAnchor="middle"
            fill="rgba(255, 255, 255, 0.85)"
            fontSize="12"
            fontWeight="700"
            letterSpacing="1"
            fontFamily="system-ui, sans-serif"
          >
            mood
          </text>
        </svg>
      </div>

      {showText && <span className="moodmix-brand-name">MoodMix</span>}
    </div>
  );
}
