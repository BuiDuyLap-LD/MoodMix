import React, { useState, useEffect, useMemo } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Sparkles, Flame, Headphones, Disc3, Music2 } from 'lucide-react';

const GRADIENTS = [
  'linear-gradient(135deg, rgba(126, 34, 206, 0.8) 0%, rgba(168, 85, 247, 0.35) 50%, rgba(24, 18, 43, 0.95) 100%)',
  'linear-gradient(135deg, rgba(14, 116, 144, 0.8) 0%, rgba(6, 182, 212, 0.35) 50%, rgba(15, 23, 42, 0.95) 100%)',
  'linear-gradient(135deg, rgba(190, 24, 93, 0.8) 0%, rgba(244, 63, 94, 0.35) 50%, rgba(46, 16, 68, 0.95) 100%)',
  'linear-gradient(135deg, rgba(180, 83, 9, 0.8) 0%, rgba(245, 158, 11, 0.35) 50%, rgba(44, 18, 10, 0.95) 100%)',
  'linear-gradient(135deg, rgba(67, 56, 202, 0.8) 0%, rgba(99, 102, 241, 0.35) 50%, rgba(17, 24, 39, 0.95) 100%)',
  'linear-gradient(135deg, rgba(5, 150, 105, 0.8) 0%, rgba(16, 185, 129, 0.35) 50%, rgba(6, 40, 28, 0.95) 100%)',
];

const DEFAULT_THEMES = [
  {
    id: 'theme-1',
    title: 'Giai Điệu Thịnh Hành',
    subtitle: 'Khám phá các ca khúc được yêu thích nhất',
    tag: 'HOT TRENDING',
    icon: Flame,
  },
  {
    id: 'theme-2',
    title: 'Bản Phát Hành Mới',
    subtitle: 'Giai điệu tươi mới vừa lên sóng',
    tag: 'MỚI RA MẮT',
    icon: Sparkles,
  },
  {
    id: 'theme-3',
    title: 'Không Gian Thư Giãn',
    subtitle: 'Thả lỏng tâm trí cùng giai điệu êm dịu',
    tag: 'CHILL & RELAX',
    icon: Headphones,
  },
];

export default function SpotlightBanner({
  featuredPlaylists = [],
  songs = [],
  currentSong,
  isPlaying,
  onPlaySong,
  onSelectPlaylist,
  lang = 'vi',
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Build slides from songs or curated playlists
  const slides = useMemo(() => {
    const list = [];

    if (songs && songs.length > 0) {
      songs.slice(0, 6).forEach((song, idx) => {
        let tag = 'GỢI Ý CHO BẠN';
        let IconComp = Sparkles;
        if (idx === 0) {
          tag = 'MỚI PHÁT HÀNH';
          IconComp = Sparkles;
        } else if (idx === 1) {
          tag = 'HOT TRENDING';
          IconComp = Flame;
        } else if (idx === 2) {
          tag = 'CHILL VIBES';
          IconComp = Headphones;
        } else {
          tag = 'BÀI HÁT TIÊU ĐIỂM';
          IconComp = Music2;
        }

        list.push({
          id: `song-${song.id}`,
          title: song.title,
          subtitle: song.artist || (lang === 'vi' ? 'Nghệ sĩ' : 'Artist'),
          cover_url: song.cover_url,
          tag,
          icon: IconComp,
          song,
          gradient: GRADIENTS[idx % GRADIENTS.length],
        });
      });
    }

    // If still less than 3, fill with default curated aesthetic cards
    if (list.length < 3) {
      DEFAULT_THEMES.slice(list.length, 3).forEach((theme, idx) => {
        list.push({
          id: theme.id,
          title: lang === 'vi' ? theme.title : 'Featured Melody',
          subtitle: lang === 'vi' ? theme.subtitle : 'Curated music stream',
          tag: theme.tag,
          icon: theme.icon,
          cover_url: null,
          song: songs?.[0] || null,
          gradient: GRADIENTS[(list.length + idx) % GRADIENTS.length],
        });
      });
    }

    return list;
  }, [songs, lang]);

  const total = slides.length;

  // Auto sliding carousel every 5 seconds when not hovered and has more than 3 items
  useEffect(() => {
    if (total <= 3 || isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 5000);
    return () => clearInterval(timer);
  }, [total, isHovered]);

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  // Determine the 3 visible slides
  const visibleSlides = useMemo(() => {
    if (total <= 3) return slides;
    return [
      slides[currentIndex % total],
      slides[(currentIndex + 1) % total],
      slides[(currentIndex + 2) % total],
    ];
  }, [slides, currentIndex, total]);

  const handleSlideClick = (slide) => {
    if (slide.song && onPlaySong) {
      onPlaySong(slide.song);
    }
  };

  return (
    <div
      className="hero-carousel-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Navigation Arrow Left */}
      {total > 3 && (
        <button
          type="button"
          className="hero-carousel-arrow prev"
          onClick={handlePrev}
          aria-label="Previous Banner"
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {/* 3 Landscape Banners Grid */}
      <div className="hero-carousel-grid">
        {visibleSlides.map((slide, idx) => {
          const TagIcon = slide.icon || Sparkles;
          const isCurrentPlaying =
            slide.song &&
            currentSong?.id === slide.song.id &&
            isPlaying;

          return (
            <div
              key={`${slide.id}-${idx}`}
              className={`hero-banner-card ${isCurrentPlaying ? 'is-playing' : ''}`}
              style={{ background: slide.gradient }}
              onClick={() => handleSlideClick(slide)}
            >
              {/* Left Column: Tag, Title, Subtitle, Play Button */}
              <div className="hero-banner-left">
                <div className="hero-banner-tag">
                  <TagIcon size={12} className="hero-tag-icon" />
                  <span>{slide.tag}</span>
                </div>

                <h3 className="hero-banner-title" title={slide.title}>
                  {slide.title}
                </h3>

                <p className="hero-banner-subtitle" title={slide.subtitle}>
                  {slide.subtitle}
                </p>

                <button
                  type="button"
                  className={`hero-banner-play-btn ${isCurrentPlaying ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSlideClick(slide);
                  }}
                >
                  {isCurrentPlaying ? (
                    <>
                      <Pause size={15} className="fill-white" />
                      <span>{lang === 'vi' ? 'ĐANG PHÁT' : 'PLAYING'}</span>
                    </>
                  ) : (
                    <>
                      <Play size={15} className="fill-white translate-x-0.5" />
                      <span>{lang === 'vi' ? 'PHÁT NGAY' : 'PLAY NOW'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: Artwork Cover with Vinyl disk peek */}
              <div className="hero-banner-right">
                <div className="hero-cover-wrapper">
                  {slide.cover_url ? (
                    <img
                      src={slide.cover_url}
                      alt={slide.title}
                      className={`hero-cover-img ${isCurrentPlaying ? 'playing-disc' : ''}`}
                    />
                  ) : (
                    <div className="hero-cover-fallback">
                      <Disc3 size={44} className="text-white/40" />
                    </div>
                  )}

                  {/* Equalizer indicator if playing */}
                  {isCurrentPlaying && (
                    <div className="hero-playing-eq">
                      <span className="eq-bar bar1" />
                      <span className="eq-bar bar2" />
                      <span className="eq-bar bar3" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrow Right */}
      {total > 3 && (
        <button
          type="button"
          className="hero-carousel-arrow next"
          onClick={handleNext}
          aria-label="Next Banner"
        >
          <ChevronRight size={22} />
        </button>
      )}

      {/* Indicator dots */}
      {total > 3 && (
        <div className="hero-carousel-dots">
          {slides.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              className={`hero-dot ${dotIdx === currentIndex ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(dotIdx);
              }}
              aria-label={`Go to slide ${dotIdx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
