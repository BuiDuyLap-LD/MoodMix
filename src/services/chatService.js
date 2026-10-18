import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ADMIN_EMAIL = 'buil14955@gmail.com';

/**
 * Lấy danh sách tin nhắn cộng đồng gần nhất
 */
export const getCommunityMessages = async (limit = 100) => {
  if (!isSupabaseConfigured || !supabase) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('community_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.warn('Lỗi getCommunityMessages:', error.message);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error('Lỗi khi tải tin nhắn cộng đồng:', err);
    return { data: [], error: err };
  }
};

/**
 * Gửi tin nhắn mới vào phòng chat cộng đồng
 */
export const sendCommunityMessage = async ({
  userId,
  userEmail,
  userName,
  userAvatar,
  message
}) => {
  if (!isSupabaseConfigured || !supabase || !userId || !message?.trim()) {
    return { success: false, error: 'Thiếu thông tin tin nhắn' };
  }

  try {
    const { data, error } = await supabase
      .from('community_messages')
      .insert([{
        user_id: userId,
        user_email: userEmail,
        user_name: userName || userEmail.split('@')[0],
        user_avatar: userAvatar || null,
        message: message.trim(),
        is_pinned: false
      }])
      .select();

    if (error) {
      console.error('Lỗi gửi tin nhắn:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data?.[0] };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Xóa tin nhắn (Admin có quyền xóa mọi tin, User chỉ xóa tin của mình)
 */
export const deleteCommunityMessage = async (messageId) => {
  if (!isSupabaseConfigured || !supabase || !messageId) {
    return { success: false };
  }

  try {
    const { error } = await supabase
      .from('community_messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Lỗi xóa tin nhắn:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Ghim hoặc bỏ ghim tin nhắn (Dành riêng cho Admin)
 */
export const togglePinCommunityMessage = async (messageId, currentPinnedState) => {
  if (!isSupabaseConfigured || !supabase || !messageId) {
    return { success: false };
  }

  try {
    const { error } = await supabase
      .from('community_messages')
      .update({ is_pinned: !currentPinnedState })
      .eq('id', messageId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Lỗi ghim tin nhắn:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Xóa toàn bộ tin nhắn cộng đồng (Dành riêng cho Admin)
 */
export const clearAllCommunityMessages = async () => {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false };
  }

  try {
    const { error } = await supabase
      .from('community_messages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Xóa tất cả

    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Lắng nghe tin nhắn Realtime qua Supabase WebSocket Channel
 */
export const subscribeToCommunityChat = (onInsert, onDelete, onUpdate) => {
  if (!isSupabaseConfigured || !supabase) {
    return { unsubscribe: () => {} };
  }

  const channel = supabase
    .channel('community-chat-room')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'community_messages' },
      (payload) => {
        onInsert?.(payload.new);
      }
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'community_messages' },
      (payload) => {
        onDelete?.(payload.old);
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'community_messages' },
      (payload) => {
        onUpdate?.(payload.new);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    }
  };
};
