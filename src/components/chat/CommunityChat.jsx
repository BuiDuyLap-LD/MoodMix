import React, { useState, useEffect, useRef } from 'react';
import { 
  MessagesSquare, Send, Trash2, Pin, Shield, Crown, Sparkles, 
  LogIn, User, AlertCircle, Smile, Loader2, CheckCheck, Radio 
} from 'lucide-react';
import { 
  getCommunityMessages, 
  sendCommunityMessage, 
  deleteCommunityMessage, 
  togglePinCommunityMessage, 
  clearAllCommunityMessages, 
  subscribeToCommunityChat 
} from '../../services/chatService';

const ADMIN_EMAIL = 'buil14955@gmail.com';

const QUICK_EMOJIS = ['🎵', '🔥', '❤️', '🎧', '👏', '😍', '✨', '☕'];

export default function CommunityChat({ user, onOpenLogin, lang = 'vi' }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cooldown, setCooldown] = useState(0);
  const lastSendTimeRef = useRef(0);
  const messagesEndRef = useRef(null);

  const isAdmin = user && user.email === ADMIN_EMAIL;

  // Auto scroll to bottom
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Load initial messages
  const loadMessages = async () => {
    setIsLoading(true);
    const { data } = await getCommunityMessages(150);
    setMessages(data || []);
    setIsLoading(false);
    setTimeout(() => scrollToBottom('auto'), 150);
  };

  useEffect(() => {
    loadMessages();

    // Subscribe to realtime changes
    const subscription = subscribeToCommunityChat(
      (newMsg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        setTimeout(() => scrollToBottom('smooth'), 100);
      },
      (deletedMsg) => {
        setMessages((prev) => prev.filter((m) => m.id !== deletedMsg.id));
      },
      (updatedMsg) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
        );
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handle Send Message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isSending) return;

    if (!user) {
      onOpenLogin?.();
      return;
    }

    // Rate Limiting: Chống spam tin nhắn liên tục (3 giây cooldown)
    const now = Date.now();
    if (!isAdmin && now - lastSendTimeRef.current < 3000) {
      const waitSec = Math.ceil((3000 - (now - lastSendTimeRef.current)) / 1000);
      setCooldown(waitSec);
      alert(`Vui lòng chờ ${waitSec} giây trước khi gửi tin nhắn tiếp theo để tránh spam.`);
      return;
    }

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    const userName = user.user_metadata?.full_name || user.email.split('@')[0];
    const userAvatar = user.user_metadata?.avatar_url || null;

    const res = await sendCommunityMessage({
      userId: user.id,
      userEmail: user.email,
      userName,
      userAvatar,
      message: text
    });

    setIsSending(false);
    lastSendTimeRef.current = Date.now();
    if (!isAdmin) setCooldown(3);

    if (res.success && res.data) {
      // Optimistic check in case realtime has slight delay
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.data.id)) return prev;
        return [...prev, res.data];
      });
      setTimeout(() => scrollToBottom('smooth'), 50);
    } else if (!res.success) {
      alert(`Không thể gửi tin nhắn: ${res.error}`);
    }
  };

  // Handle Delete Message
  const handleDeleteMessage = async (messageId) => {
    if (!confirm(lang === 'vi' ? 'Bạn có chắc chắn muốn xóa tin nhắn này?' : 'Delete this message?')) {
      return;
    }
    const res = await deleteCommunityMessage(messageId);
    if (res.success) {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    }
  };

  // Handle Pin / Unpin (Admin only)
  const handleTogglePin = async (messageId, currentPinnedState) => {
    const res = await togglePinCommunityMessage(messageId, currentPinnedState);
    if (res.success) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, is_pinned: !currentPinnedState } : m
        )
      );
    }
  };

  // Handle Clear All Messages (Admin only)
  const handleClearAllChat = async () => {
    if (!confirm(lang === 'vi' ? 'CẢNH BÁO: Bạn có chắc chắn muốn dọn sạch toàn bộ phòng chat?' : 'Clear all chat messages?')) {
      return;
    }
    const res = await clearAllCommunityMessages();
    if (res.success) {
      setMessages([]);
    }
  };

  const pinnedMessage = messages.find((m) => m.is_pinned);

  // Format timestamp (e.g. 22:35)
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="community-chat-container">
      {/* 1. Header */}
      <div className="chat-header-bar">
        <div className="chat-header-left">
          <div className="chat-icon-circle">
            <MessagesSquare size={22} className="text-purple" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="chat-room-title">
                {lang === 'vi' ? 'Chat Cộng Đồng' : 'Community Chat'}
              </h2>
              <span className="live-status-pill">
                <span className="live-dot" />
                REALTIME
              </span>
            </div>
            <p className="chat-room-sub">
              {lang === 'vi' 
                ? 'Không gian giao lưu âm nhạc trực tiếp giữa tất cả người dùng' 
                : 'Live music conversation space with all members'}
            </p>
          </div>
        </div>

        {/* Admin Toolbar if Admin logged in */}
        {isAdmin && (
          <div className="admin-chat-toolbar">
            <div className="admin-status-badge">
              <Crown size={14} className="text-amber-400" />
              <span>ADMIN: BUIL14955</span>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                className="btn-clear-chat"
                onClick={handleClearAllChat}
                title="Dọn sạch phòng chat"
              >
                <Trash2 size={14} />
                <span>{lang === 'vi' ? 'Dọn sạch chat' : 'Clear chat'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Pinned Message Banner (If any) */}
      {pinnedMessage && (
        <div className="chat-pinned-banner">
          <Pin size={16} className="text-amber-400 fill-amber-400 flex-shrink-0" />
          <div className="pinned-content">
            <span className="pinned-label">
              {lang === 'vi' ? 'THÔNG BÁO GHIM CỦA ADMIN' : 'PINNED BY ADMIN'}:
            </span>
            <span className="pinned-text">{pinnedMessage.message}</span>
          </div>
          {isAdmin && (
            <button
              type="button"
              className="btn-unpin-small"
              onClick={() => handleTogglePin(pinnedMessage.id, true)}
              title="Bỏ ghim"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* 3. Message Stream List */}
      <div className="chat-messages-viewport">
        {isLoading ? (
          <div className="chat-loading-state">
            <Loader2 size={36} className="animate-spin text-purple mb-2" />
            <p>{lang === 'vi' ? 'Đang kết nối phòng chat...' : 'Connecting to chat room...'}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-empty-welcome">
            <Sparkles size={44} className="text-purple mb-3" />
            <h3>{lang === 'vi' ? 'Chào mừng bạn đến với Phòng Chat Cộng Đồng!' : 'Welcome to Community Chat!'}</h3>
            <p>
              {lang === 'vi'
                ? 'Chưa có tin nhắn nào. Hãy là người đầu tiên gửi lời chào đến mọi người nào!'
                : 'No messages yet. Be the first to say hello!'}
            </p>
          </div>
        ) : (
          <div className="chat-messages-list">
            {messages.map((msg, index) => {
              const isMsgAdmin = msg.user_email === ADMIN_EMAIL;
              const isOwnMessage = user && user.id === msg.user_id;

              return (
                <div
                  key={msg.id || index}
                  className={`chat-message-row ${isOwnMessage ? 'own-message' : ''} ${msg.is_pinned ? 'is-pinned-row' : ''}`}
                >
                  {/* Avatar */}
                  <div className="chat-avatar-box">
                    {msg.user_avatar ? (
                      <img src={msg.user_avatar} alt={msg.user_name} className="chat-avatar-img" />
                    ) : (
                      <div className={`chat-avatar-default ${isMsgAdmin ? 'admin-avatar' : ''}`}>
                        {msg.user_name ? msg.user_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>

                  {/* Bubble Content */}
                  <div className="chat-bubble-container">
                    <div className="chat-sender-header">
                      <span className="chat-sender-name">
                        {msg.user_name || msg.user_email?.split('@')[0]}
                      </span>

                      {/* Admin or Member Badge */}
                      {isMsgAdmin ? (
                        <span className="badge-chat-admin">
                          <Crown size={12} />
                          <span>ADMIN</span>
                        </span>
                      ) : (
                        <span className="badge-chat-member">MEMBER</span>
                      )}

                      <span className="chat-time-text">{formatTime(msg.created_at)}</span>

                      {msg.is_pinned && (
                        <span className="pinned-indicator-pill" title="Tin nhắn đã ghim">
                          <Pin size={11} className="fill-amber-400 text-amber-400" />
                        </span>
                      )}
                    </div>

                    <div className="chat-bubble-text">
                      <p>{msg.message}</p>
                    </div>

                    {/* Actions: Pin / Delete */}
                    <div className="chat-row-actions">
                      {isAdmin && (
                        <button
                          type="button"
                          className={`btn-action-chat ${msg.is_pinned ? 'active-pin' : ''}`}
                          onClick={() => handleTogglePin(msg.id, Boolean(msg.is_pinned))}
                          title={msg.is_pinned ? 'Bỏ ghim tin nhắn' : 'Ghim tin nhắn này'}
                        >
                          <Pin size={13} />
                        </button>
                      )}

                      {(isAdmin || isOwnMessage) && (
                        <button
                          type="button"
                          className="btn-action-chat hover-delete"
                          onClick={() => handleDeleteMessage(msg.id)}
                          title={lang === 'vi' ? 'Xóa tin nhắn' : 'Delete message'}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 4. Chat Input Bar */}
      <div className="chat-input-area">
        {user ? (
          <form className="chat-input-form" onSubmit={handleSendMessage}>
            {/* Quick Emojis Bar */}
            <div className="quick-emojis-bar">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="quick-emoji-btn"
                  onClick={() => setInputText((prev) => prev + emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="chat-input-box">
              <input
                type="text"
                className="chat-text-input"
                placeholder={lang === 'vi' ? 'Nhập tin nhắn giao lưu với cộng đồng...' : 'Type a community message...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                maxLength={500}
                disabled={isSending}
              />

              <button
                type="submit"
                className="btn-send-message"
                disabled={!inputText.trim() || isSending || cooldown > 0}
                title={cooldown > 0 ? `Vui lòng chờ ${cooldown}s` : 'Gửi tin nhắn'}
              >
                {isSending ? (
                  <Loader2 size={18} className="animate-spin text-white" />
                ) : cooldown > 0 ? (
                  <span className="text-xs font-bold text-white">{cooldown}s</span>
                ) : (
                  <Send size={18} className="fill-white" />
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="chat-guest-notice-bar">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-purple" />
              <span>
                {lang === 'vi'
                  ? 'Đăng nhập tài khoản Google để tham gia trò chuyện cùng mọi người!'
                  : 'Sign in with Google to join the community chat!'}
              </span>
            </div>
            <button
              type="button"
              className="btn-login-to-chat"
              onClick={onOpenLogin}
            >
              <LogIn size={15} />
              <span>{lang === 'vi' ? 'ĐĂNG NHẬP NGAY' : 'SIGN IN NOW'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
