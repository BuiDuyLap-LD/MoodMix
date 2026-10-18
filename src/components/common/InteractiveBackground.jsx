import React, { useEffect, useRef } from 'react';
import { useAudio } from '../../context/AudioContext';
import { useSettings } from '../../context/SettingsContext';

/**
 * InteractiveBackground:
 * 1. Dynamic Aurora Mesh Background that subtly reacts to playing song's mood and playback state.
 * 2. Interactive Cursor Spotlight (Aura) following mouse movement smoothly with 60fps RAF.
 * 3. Interactive Click Ripple gesture wave effect.
 * All controllable via the Settings Menu.
 */
export default function InteractiveBackground() {
  const { currentSong, isPlaying } = useAudio();
  const { settings } = useSettings();
  const auraRef = useRef(null);
  const rippleContainerRef = useRef(null);

  const enableAurora = settings?.enableAurora !== false;
  const enableCursorAura = settings?.enableCursorAura !== false;
  const enableClickWave = settings?.enableClickWave !== false;

  // Track cursor position with smooth requestAnimationFrame interpolation
  useEffect(() => {
    if (!enableCursorAura) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let animationFrameId;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animate = () => {
      // Smooth interpolation (lerp)
      currentX += (mouseX - currentX) * 0.12;
      currentY += (mouseY - currentY) * 0.12;

      if (auraRef.current) {
        auraRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [enableCursorAura]);

  // Click gesture: Expanding ripple light wave
  useEffect(() => {
    if (!enableClickWave) return;

    const handleGlobalClick = (e) => {
      if (!rippleContainerRef.current) return;

      const ripple = document.createElement('div');
      ripple.className = 'interactive-click-wave';
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;

      rippleContainerRef.current.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 750);
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [enableClickWave]);

  // Determine ambient mood theme
  const mood = currentSong?.mood || 'chill';

  return (
    <div className={`dynamic-ambient-backdrop mood-${mood} ${isPlaying ? 'is-playing' : ''}`}>
      {/* 1. Organic Morphing Aurora Blobs */}
      {enableAurora && (
        <>
          <div className="aurora-blob aurora-blob-1" />
          <div className="aurora-blob aurora-blob-2" />
          <div className="aurora-blob aurora-blob-3" />
          <div className="aurora-blob aurora-blob-4" />
        </>
      )}

      {/* 2. Subtle Cinematic Star Mesh / Stardust Texture */}
      <div className="ambient-stardust-layer" />

      {/* 3. Interactive Cursor Spotlight Aura */}
      {enableCursorAura && <div ref={auraRef} className="interactive-cursor-aura" />}

      {/* 4. Click Ripple Container */}
      {enableClickWave && <div ref={rippleContainerRef} className="interactive-ripple-container" />}
    </div>
  );
}
