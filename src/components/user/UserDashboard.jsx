import React, { useState, useEffect } from 'react';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import MoodTagFilter from '../layout/MoodTagFilter';
import SpotlightBanner from '../explore/SpotlightBanner';
import SongSuggestions from '../explore/SongSuggestions';
import RecentListeningSection from '../explore/RecentListeningSection';
import NewReleasesSection from '../explore/NewReleasesSection';
import TopHitsSection from '../explore/TopHitsSection';
import NewReleaseChart from '../chart/NewReleaseChart';
import CommunityChat from '../chat/CommunityChat';
import ZingPlayer from '../layout/ZingPlayer';
import PlaylistSection from '../playlist/PlaylistSection';
import CreatePlaylistModal from '../playlist/CreatePlaylistModal';
import AddToPlaylistModal from '../playlist/AddToPlaylistModal';
import PlaylistDetailView from '../playlist/PlaylistDetailView';
import SearchResultsView from '../search/SearchResultsView';
import SongActionMenu from '../common/SongActionMenu';
import InteractiveBackground from '../common/InteractiveBackground';
import { getSongs, getPlaylists, getFavorites, toggleFavorite, deletePlaylist } from '../../services/musicService';
import { useAudio } from '../../context/AudioContext';
import { Plus, ListMusic, Heart, Music, Sparkles, Play, Pause, MoreHorizontal } from 'lucide-react';

export default function UserDashboard({ user, lang, setLang, onSignOut, onOpenLogin }) {
  const [activeNav, setActiveNav] = useState('explore');
  const [selectedMood, setSelectedMood] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Real data state from Supabase
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Selected Playlist to view detail
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  // Action Menu state for song rows
  const [actionMenuSong, setActionMenuSong] = useState(null);
  const [actionMenuPos, setActionMenuPos] = useState({ top: 0, left: 0 });

  // Playlist Modals state
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [addToPlaylistSong, setAddToPlaylistSong] = useState(null);

  // Global Audio Context
  const { currentSong, isPlaying, playSong, togglePlay, setIsQueueOpen, validateAndPurgeDeletedSongs } = useAudio();

  // Load real data from Supabase
  const loadData = async () => {
    setIsLoading(true);
    const [songsRes, playlistsRes] = await Promise.all([
      getSongs({ mood: selectedMood, searchQuery }),
      getPlaylists({ userId: user?.id })
    ]);

    const activeSongs = songsRes.data || [];
    setSongs(activeSongs);
    setPlaylists(playlistsRes.data || []);

    // Quét sạch bài hát đã bị xóa khỏi localStorage & history
    if (activeSongs.length > 0 && !searchQuery) {
      validateAndPurgeDeletedSongs(activeSongs);
    }

    if (user?.id) {
      const favRes = await getFavorites(user.id);
      setFavorites(favRes.data || []);
    } else {
      setFavorites([]);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedMood, searchQuery, user?.id]);

  const handlePlaySong = (song, playlistToPlay = songs) => {
    if (currentSong?.id === song.id && isPlaying) {
      togglePlay();
    } else {
      playSong(song, playlistToPlay);
    }
  };

  const handleToggleFav = async (songId) => {
    if (!user) {
      onOpenLogin?.();
      return;
    }

    const isFav = favorites.includes(songId);
    // Optimistic UI update
    setFavorites((prev) => (isFav ? prev.filter((id) => id !== songId) : [...prev, songId]));
    await toggleFavorite(user.id, songId, isFav);
  };

  const handleOpenCreatePlaylist = () => {
    if (!user) {
      onOpenLogin?.();
      return;
    }
    setIsCreatePlaylistOpen(true);
  };

  const handlePlaylistCreated = (newPlaylist) => {
    setPlaylists((prev) => [newPlaylist, ...prev]);
  };

  const handleDeletePlaylist = async (playlistId) => {
    try {
      await deletePlaylist(playlistId, user?.id);
      setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
      if (selectedPlaylist?.id === playlistId) {
        setSelectedPlaylist(null);
      }
    } catch (err) {
      alert(`Không thể xóa playlist: ${err.message}`);
    }
  };

  const favoriteSongs = songs.filter((s) => favorites.includes(s.id));

  return (
    <div className="zing-app-container">
      {/* Dynamic Aurora Ambient Background & Interactive Mouse Aura */}
      <InteractiveBackground />

      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={(nav) => {
          setActiveNav(nav);
          if (nav !== 'library') {
            setSelectedPlaylist(null);
          }
        }}
        user={user}
        onOpenLogin={onOpenLogin}
        onCreatePlaylist={handleOpenCreatePlaylist}
        lang={lang}
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Work Area (Header + Scrollable Content) */}
      <div className="zing-main-viewport">
        {/* Top Header */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          songs={songs}
          currentSong={currentSong}
          isPlaying={isPlaying}
          onPlaySong={(song, list) => handlePlaySong(song, list || songs)}
          lang={lang}
          setLang={setLang}
          user={user}
          onOpenLogin={onOpenLogin}
          onSignOut={onSignOut}
          onToggleSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
          isSidebarOpen={isMobileSidebarOpen}
          onNavigateHome={() => {
            setActiveNav('explore');
            setSelectedPlaylist(null);
          }}
        />

        {/* Scrollable Viewport */}
        <main className="zing-content-scroll">
          
          {/* If there is an active search query, display dedicated Search Results View */}
          {searchQuery && searchQuery.trim() ? (
            <SearchResultsView
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
              songs={songs}
              currentSong={currentSong}
              isPlaying={isPlaying}
              favorites={favorites}
              onPlaySong={(song, list) => handlePlaySong(song, list || songs)}
              onToggleFavorite={handleToggleFav}
              onOpenAddToPlaylist={(song) => setAddToPlaylistSong(song)}
              lang={lang}
            />
          ) : (
            <>
          {activeNav === 'explore' && (
            <div className="explore-view-wrapper">
              {/* Horizontal Category Mood Filter */}
              <MoodTagFilter
                selectedMood={selectedMood}
                onSelectMood={setSelectedMood}
                lang={lang}
              />

              {/* Hero Banner Carousel (3 Banners chuẩn Zing MP3) */}
              <SpotlightBanner
                featuredPlaylists={playlists}
                songs={songs}
                currentSong={currentSong}
                isPlaying={isPlaying}
                onPlaySong={(song) => handlePlaySong(song, songs)}
                onSelectPlaylist={(pl) => {
                  setSelectedPlaylist(pl);
                  setActiveNav('library');
                }}
                lang={lang}
              />

              {/* 1. Song Suggestions Grid (Matching Top of User's Image) */}
              <SongSuggestions
                songs={songs}
                currentSong={currentSong}
                isPlaying={isPlaying}
                favorites={favorites}
                onPlaySong={(song) => handlePlaySong(song, songs)}
                onToggleFavorite={handleToggleFav}
                onOpenAddToPlaylist={(song) => setAddToPlaylistSong(song)}
                onRefresh={loadData}
                lang={lang}
              />

              {/* 2. Recently Listened Cards Row (Matching Bottom of User's Image) */}
              <RecentListeningSection
                songs={songs}
                onOpenRecentDrawer={() => setIsQueueOpen(true)}
                lang={lang}
              />

              {/* 3. New Releases Section (Latest Admin Uploads) */}
              <NewReleasesSection
                songs={songs}
                currentSong={currentSong}
                isPlaying={isPlaying}
                favorites={favorites}
                onPlaySong={(song) => handlePlaySong(song, songs)}
                onToggleFavorite={handleToggleFav}
                onOpenAddToPlaylist={(song) => setAddToPlaylistSong(song)}
                lang={lang}
              />

              {/* 4. Top Hits / Most Listened Section */}
              <TopHitsSection
                songs={songs}
                currentSong={currentSong}
                isPlaying={isPlaying}
                favorites={favorites}
                onPlaySong={(song) => handlePlaySong(song, songs)}
                onToggleFavorite={handleToggleFav}
                onOpenAddToPlaylist={(song) => setAddToPlaylistSong(song)}
                lang={lang}
              />
            </div>
          )}

          {/* Active Navigation: Library (Thư Viện Cá Nhân - Giao diện Chuẩn Playlist & Favorites) */}
          {activeNav === 'library' && (
            <div className="library-view-wrapper">
              {selectedPlaylist ? (
                <PlaylistDetailView
                  playlist={selectedPlaylist}
                  user={user}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFav}
                  onBack={() => setSelectedPlaylist(null)}
                  onNavigateExplore={() => {
                    setSelectedPlaylist(null);
                    setActiveNav('explore');
                  }}
                  onDeletePlaylist={handleDeletePlaylist}
                  lang={lang}
                />
              ) : (
                <>
                  {/* 1. Playlist Section matching Image 2 */}
                  <PlaylistSection
                    playlists={playlists}
                    songs={songs}
                    user={user}
                    onCreatePlaylist={handleOpenCreatePlaylist}
                    onDeletePlaylist={handleDeletePlaylist}
                    onSelectPlaylist={(pl) => setSelectedPlaylist(pl)}
                    lang={lang}
                  />

                  {/* Divider between Playlists & Favorite Songs */}
                  <div className="sidebar-divider my-4" />

                  {/* 2. Favorite Songs Collection Header */}
                  <div className="library-header-box glass-card">
                    <div className="library-header-left">
                      <div className="library-icon-square">
                        <Heart size={32} className="text-red fill-red" />
                      </div>
                      <div>
                        <span className="library-badge-pill">
                          {lang === 'vi' ? 'BỘ SƯU TẬP' : 'COLLECTION'}
                        </span>
                        <h2 className="library-title">
                          {lang === 'vi' ? 'Bài Hát Yêu Thích' : 'Favorite Songs'}
                        </h2>
                        <p className="library-sub">
                          {user ? user.email : (lang === 'vi' ? 'Khách (Đăng nhập để đồng bộ database)' : 'Guest (Sign in to sync database)')} • {favoriteSongs.length} {lang === 'vi' ? 'bài hát' : 'tracks'}
                        </p>
                      </div>
                    </div>

                    {favoriteSongs.length > 0 && (
                      <button
                        type="button"
                        className="library-play-all-btn"
                        onClick={() => handlePlaySong(favoriteSongs[0], favoriteSongs)}
                      >
                        <Play size={18} className="fill-white" />
                        <span>{lang === 'vi' ? 'PHÁT TẤT CẢ' : 'PLAY ALL'}</span>
                      </button>
                    )}
                  </div>

              {/* Favorite Songs List */}
              {favoriteSongs.length > 0 ? (
                <div className="library-songs-list">
                  {favoriteSongs.map((song, idx) => {
                    const isCurrent = currentSong?.id === song.id;
                    return (
                      <div
                        key={song.id}
                        className={`library-song-row ${isCurrent ? 'active' : ''}`}
                        onClick={() => handlePlaySong(song, favoriteSongs)}
                      >
                        <span className="lib-num">{idx + 1}</span>
                        <div className="lib-cover">
                          {song.cover_url ? (
                            <img src={song.cover_url} alt={song.title} />
                          ) : (
                            <Music size={16} />
                          )}
                          <div className="lib-play-hover">
                            {isCurrent && isPlaying ? (
                              <Pause size={14} className="fill-white" />
                            ) : (
                              <Play size={14} className="fill-white" />
                            )}
                          </div>
                        </div>

                        <div className="lib-meta">
                          <span className="lib-title">{song.title}</span>
                          <span className="lib-artist">{song.artist}</span>
                        </div>

                        <span className="lib-mood tag-pill">{song.mood}</span>
                        <span className="lib-duration">{song.duration || '03:30'}</span>

                        <button
                          type="button"
                          className="lib-fav-btn text-muted hover:text-white mr-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setActionMenuPos({
                              top: rect.bottom + 6,
                              left: Math.max(16, rect.left - 180),
                            });
                            setActionMenuSong(song);
                          }}
                          title={lang === 'vi' ? 'Tùy chọn bài hát' : 'Song options'}
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        <button
                          type="button"
                          className="lib-fav-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFav(song.id);
                          }}
                          title="Bỏ thích"
                        >
                          <Heart size={18} fill="#ef4444" color="#ef4444" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-section-view">
                  <div className="empty-center-card glass-card">
                    <Heart size={44} className="text-red mb-3" />
                    <h3>{lang === 'vi' ? 'Chưa có bài hát yêu thích' : 'No favorite songs yet'}</h3>
                    <p>
                      {lang === 'vi'
                        ? 'Hãy nhấn vào biểu tượng trái tim ở các bài hát trong mục Khám Phá để tự động lưu vào database Supabase.'
                        : 'Click the heart icon on any song in Explore to automatically save to Supabase database.'}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

          {/* Active Navigation: BXH Nhạc Mới (New Release Chart matching exact user design) */}
          {activeNav === 'new-release' && (
            <NewReleaseChart
              songs={songs}
              favorites={favorites}
              onToggleFavorite={handleToggleFav}
              onOpenAddToPlaylist={(song) => setAddToPlaylistSong(song)}
              lang={lang}
            />
          )}

          {/* Active Navigation: Chat Cộng Đồng (Community Realtime Chat) */}
          {activeNav === 'community-chat' && (
            <CommunityChat
              user={user}
              onOpenLogin={onOpenLogin}
              lang={lang}
            />
          )}

            </>
          )}

        </main>
      </div>

      {/* 3. Bottom Sticky Player Bar (Connected to Global Audio Context) */}
      <ZingPlayer
        isFavorite={favorites.includes(currentSong?.id)}
        onToggleFavorite={handleToggleFav}
        lang={lang}
      />

      {/* 4. Modal: Tạo playlist mới (Chuẩn thiết kế Image 1) */}
      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
        onPlaylistCreated={handlePlaylistCreated}
        user={user}
        onOpenLogin={onOpenLogin}
        lang={lang}
      />

      {/* 5. Modal: Thêm bài hát vào Playlist */}
      <AddToPlaylistModal
        isOpen={Boolean(addToPlaylistSong)}
        onClose={() => setAddToPlaylistSong(null)}
        song={addToPlaylistSong}
        playlists={playlists}
        user={user}
        onOpenCreatePlaylist={() => {
          setAddToPlaylistSong(null);
          handleOpenCreatePlaylist();
        }}
        lang={lang}
      />

      {/* 6. Action Menu Popover (Play Next, Add to Queue, Add to Playlist, Copy Link) */}
      <SongActionMenu
        song={actionMenuSong}
        isOpen={Boolean(actionMenuSong)}
        onClose={() => setActionMenuSong(null)}
        position={actionMenuPos}
        onOpenAddToPlaylist={(song) => setAddToPlaylistSong(song)}
        isFavorite={favorites.includes(actionMenuSong?.id)}
        onToggleFavorite={handleToggleFav}
        lang={lang}
      />
    </div>
  );
}
