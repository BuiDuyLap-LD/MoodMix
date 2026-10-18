import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Service giao tiếp trực tiếp với Supabase Database & Storage
 * Phục vụ cả phía Người dùng và Quản trị viên (Admin).
 */

/**
 * Hàm loại bỏ dấu tiếng Việt để tìm kiếm thông minh không phân biệt có dấu / không dấu
 */
export const removeVietnameseTones = (str = '') => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
};

// Lấy danh sách bài hát (hỗ trợ tìm kiếm thông minh không phân biệt dấu tiếng Việt)
export const getSongs = async ({ mood = 'all', searchQuery = '' } = {}) => {
  if (!isSupabaseConfigured || !supabase) {
    return { data: [], error: null };
  }

  try {
    let query = supabase.from('songs').select('*').order('created_at', { ascending: false });

    // Khi không tìm kiếm, lọc theo mood nếu có
    if (mood && mood !== 'all' && !searchQuery) {
      query = query.eq('mood', mood);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Lỗi bảng songs (có thể chưa chạy SQL schema):', error.message);
      return { data: [], error };
    }

    let result = data || [];

    // Tìm kiếm thông minh tiếng Việt (hỗ trợ cả có dấu và không dấu, tìm theo tên, ca sĩ, thể loại, tâm trạng)
    if (searchQuery && searchQuery.trim()) {
      const q = removeVietnameseTones(searchQuery);
      result = result.filter((song) => {
        const titleNorm = removeVietnameseTones(song.title);
        const artistNorm = removeVietnameseTones(song.artist);
        const genreNorm = removeVietnameseTones(song.genre);
        const moodNorm = removeVietnameseTones(song.mood);

        return (
          titleNorm.includes(q) ||
          artistNorm.includes(q) ||
          genreNorm.includes(q) ||
          moodNorm.includes(q)
        );
      });
    }

    return { data: result, error: null };
  } catch (err) {
    console.warn('Lỗi kết nối songs:', err);
    return { data: [], error: err };
  }
};

// Lấy danh sách playlist (hỗ trợ lọc theo userId nếu có)
export const getPlaylists = async ({ userId = null } = {}) => {
  if (!isSupabaseConfigured || !supabase) {
    return { data: [], error: null };
  }

  try {
    let query = supabase
      .from('playlists')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      // Lấy cả playlist công khai và playlist do chính user tạo
      query = query.or(`is_public.eq.true,user_id.eq.${userId}`);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Lỗi getPlaylists:', error.message);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (err) {
    return { data: [], error: err };
  }
};

/**
 * Tạo mới một Playlist trong Supabase
 */
export const createPlaylist = async ({
  title,
  userId,
  isPublic = true,
  isShuffle = true,
  description = '',
  coverUrl = null
}) => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase chưa được cấu hình.');
  }

  if (!title || !title.trim()) {
    throw new Error('Vui lòng nhập tên playlist.');
  }

  const payload = {
    title: title.trim(),
    user_id: userId,
    is_public: isPublic,
    is_shuffle: isShuffle,
    description: description || 'Playlist do người dùng tạo',
    cover_url: coverUrl || null
  };

  try {
    const { data, error } = await supabase
      .from('playlists')
      .insert([payload])
      .select();

    if (error) {
      // Nếu lỗi do cột is_shuffle chưa tồn tại trong schema cũ, thử lại mà không truyền is_shuffle
      if (error.message && error.message.includes('is_shuffle')) {
        delete payload.is_shuffle;
        const retry = await supabase.from('playlists').insert([payload]).select();
        if (retry.error) throw retry.error;
        return retry.data?.[0];
      }
      throw error;
    }

    return data?.[0];
  } catch (err) {
    console.error('Lỗi khi tạo playlist:', err);
    throw err;
  }
};

/**
 * Xóa một Playlist khỏi Supabase
 */
export const deletePlaylist = async (playlistId, userId) => {
  if (!isSupabaseConfigured || !supabase || !playlistId) {
    throw new Error('Thiếu thông tin để xóa playlist.');
  }

  try {
    let query = supabase.from('playlists').delete().eq('id', playlistId);
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { error } = await query;
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Lỗi khi xóa playlist:', err);
    throw err;
  }
};

/**
 * Thêm bài hát vào playlist
 */
export const addSongToPlaylist = async (playlistId, songId) => {
  if (!isSupabaseConfigured || !supabase || !playlistId || !songId) {
    return { success: false };
  }

  try {
    const { error } = await supabase
      .from('playlist_songs')
      .insert([{ playlist_id: playlistId, song_id: songId }]);

    if (error) {
      console.warn('Lỗi thêm bài vào playlist:', error.message);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
};

/**
 * Xóa bài hát khỏi playlist
 */
export const removeSongFromPlaylist = async (playlistId, songId) => {
  if (!isSupabaseConfigured || !supabase || !playlistId || !songId) {
    return { success: false };
  }

  try {
    const { error } = await supabase
      .from('playlist_songs')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('song_id', songId);

    return { success: !error };
  } catch {
    return { success: false };
  }
};

/**
 * Lấy danh sách bài hát trong một playlist cụ thể
 */
export const getPlaylistSongs = async (playlistId) => {
  if (!isSupabaseConfigured || !supabase || !playlistId) {
    return { data: [], error: null };
  }

  try {
    // 1. Thử query quan hệ trực tiếp
    const { data, error } = await supabase
      .from('playlist_songs')
      .select('song_id, songs(*)')
      .eq('playlist_id', playlistId);

    if (!error && data) {
      const mapped = data.map((item) => item.songs).filter(Boolean);
      // Nếu có bài hát hoặc bảng rỗng hợp lệ
      if (mapped.length > 0 || data.length === 0) {
        return { data: mapped, error: null };
      }
    }

    // 2. Dự phòng 2 bước: lấy danh sách song_id rồi truy vấn bảng songs
    const { data: linkData, error: linkErr } = await supabase
      .from('playlist_songs')
      .select('song_id')
      .eq('playlist_id', playlistId);

    if (linkErr) {
      console.warn('Lỗi query playlist_songs:', linkErr);
      return { data: [], error: linkErr };
    }

    if (!linkData || linkData.length === 0) {
      return { data: [], error: null };
    }

    const songIds = linkData.map((d) => d.song_id).filter(Boolean);
    if (songIds.length === 0) {
      return { data: [], error: null };
    }

    const { data: songData, error: songErr } = await supabase
      .from('songs')
      .select('*')
      .in('id', songIds);

    if (songErr) return { data: [], error: songErr };
    return { data: songData || [], error: null };
  } catch (err) {
    console.error('Lỗi lấy bài hát trong playlist:', err);
    return { data: [], error: err };
  }
};

// Lấy danh sách bài hát yêu thích của user
export const getFavorites = async (userId) => {
  if (!isSupabaseConfigured || !supabase || !userId) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('song_id')
      .eq('user_id', userId);

    if (error) {
      return { data: [], error };
    }

    return { data: (data || []).map((f) => f.song_id), error: null };
  } catch (err) {
    return { data: [], error: err };
  }
};

// Toggle bài hát yêu thích
export const toggleFavorite = async (userId, songId, isCurrentlyFavorited) => {
  if (!isSupabaseConfigured || !supabase || !userId) {
    return { success: false };
  }

  try {
    if (isCurrentlyFavorited) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('song_id', songId);
      return { success: !error };
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: userId, song_id: songId });
      return { success: !error };
    }
  } catch {
    return { success: false };
  }
};

// =====================================================================
// ADMIN FUNCTIONS: Upload file, Thêm bài hát, Xóa bài hát
// =====================================================================

/**
 * Upload file (MP3 hoặc Ảnh bìa) lên Supabase Storage
 * @param {File} file File đối tượng
 * @param {string} bucket Tên bucket ('music' hoặc 'covers')
 * @param {string} folder Thư mục con ('audio' hoặc 'images')
 */
export const uploadMediaFile = async (file, bucket = 'music', folder = 'audio') => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase chưa được cấu hình.');
  }

  // Chuẩn hóa tên file an toàn (bỏ ký tự lạ, thêm timestamp)
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${folder}/${Date.now()}_${cleanName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw error;
  }

  // Lấy Public URL để lưu vào database
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return { publicUrl, filePath };
};

/**
 * Thêm một bài hát mới vào cơ sở dữ liệu Supabase
 */
export const createSong = async (songPayload) => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase chưa được cấu hình.');
  }

  const { data, error } = await supabase
    .from('songs')
    .insert([{
      title: songPayload.title.trim(),
      artist: songPayload.artist.trim(),
      audio_url: songPayload.audio_url,
      cover_url: songPayload.cover_url || null,
      mood: songPayload.mood || 'chill',
      genre: songPayload.genre || 'V-Pop',
      duration: songPayload.duration || '03:30',
      is_featured: Boolean(songPayload.is_featured)
    }])
    .select();

  if (error) {
    throw error;
  }

  return data?.[0];
};

/**
 * Xóa một bài hát khỏi cơ sở dữ liệu và xóa triệt để file vật lý trên Supabase Storage
 */
export const deleteSong = async (songId) => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase chưa được cấu hình.');
  }

  // 1. Lấy thông tin bài hát trước khi xóa để truy xuất đường dẫn file vật lý trong Storage
  try {
    const { data: song } = await supabase
      .from('songs')
      .select('id, audio_url, cover_url')
      .eq('id', songId)
      .single();

    if (song) {
      const filesToRemove = [];
      // Trích xuất path file audio trong bucket music
      if (song.audio_url && song.audio_url.includes('/storage/v1/object/public/music/')) {
        const audioPath = song.audio_url.split('/storage/v1/object/public/music/')[1];
        if (audioPath) filesToRemove.push(decodeURIComponent(audioPath));
      }
      // Trích xuất path file ảnh bìa trong bucket music
      if (song.cover_url && song.cover_url.includes('/storage/v1/object/public/music/')) {
        const coverPath = song.cover_url.split('/storage/v1/object/public/music/')[1];
        if (coverPath) filesToRemove.push(decodeURIComponent(coverPath));
      }

      // Xóa file vật lý khỏi Supabase Storage
      if (filesToRemove.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('music')
          .remove(filesToRemove);
        if (storageError) {
          console.warn('Lỗi khi xóa file vật lý trong storage:', storageError.message);
        }
      }
    }
  } catch (lookupErr) {
    console.warn('Không thể tìm thấy file storage tương ứng để xóa:', lookupErr);
  }

  // 2. Xóa các quan hệ phụ thuộc trong bảng playlist_songs và favorites (nếu có)
  try {
    await supabase.from('playlist_songs').delete().eq('song_id', songId);
    await supabase.from('favorites').delete().eq('song_id', songId);
  } catch (relErr) {
    console.warn('Lỗi dọn dẹp quan hệ playlist_songs/favorites:', relErr);
  }

  // 3. Xóa dòng bài hát khỏi bảng songs
  const { error } = await supabase
    .from('songs')
    .delete()
    .eq('id', songId);

  if (error) {
    throw error;
  }

  // 4. Phát tín hiệu toàn cục để Client lập tức xóa bài hát khỏi lịch sử nghe & hàng đợi
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('moodmix:song_deleted', { detail: { songId } }));
  }

  return true;
};
