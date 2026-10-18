-- =====================================================================
-- MOODMIX DATABASE SCHEMA & POLICIES (Supabase PostgreSQL)
-- Chạy đoạn mã này trong: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =====================================================================

-- 1. Bảng lưu trữ bài hát (Songs)
CREATE TABLE IF NOT EXISTS public.songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  mood TEXT NOT NULL DEFAULT 'chill',
  genre TEXT DEFAULT 'V-Pop',
  duration TEXT DEFAULT '03:30',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Bảng lưu trữ Playlists
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT true,
  is_shuffle BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Bảng bài hát trong Playlist (Playlist Songs)
CREATE TABLE IF NOT EXISTS public.playlist_songs (
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (playlist_id, song_id)
);

-- 4. Bảng bài hát yêu thích (Favorites)
CREATE TABLE IF NOT EXISTS public.favorites (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (user_id, song_id)
);

-- 5. Bảng Chat Cộng Đồng Thời Gian Thực (Community Realtime Messages)
CREATE TABLE IF NOT EXISTS public.community_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT,
  user_avatar TEXT,
  message TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================================
-- PHÂN QUYỀN ROW LEVEL SECURITY (RLS) - BẢO MẬT ADMIN ĐỘC QUYỀN
-- Chỉ có tài khoản: buil14955@gmail.com được cấp quyền Quản trị (Admin)
-- =====================================================================

ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- DROP các policy cũ nếu có để tránh trùng lặp
DROP POLICY IF EXISTS "Cho phép đọc bài hát công khai" ON public.songs;
DROP POLICY IF EXISTS "Cho phép thêm bài hát" ON public.songs;
DROP POLICY IF EXISTS "Cho phép sửa xóa bài hát" ON public.songs;
DROP POLICY IF EXISTS "Chỉ Admin buil14955 được thêm bài hát" ON public.songs;
DROP POLICY IF EXISTS "Chỉ Admin buil14955 được sửa bài hát" ON public.songs;
DROP POLICY IF EXISTS "Chỉ Admin buil14955 được xóa bài hát" ON public.songs;

-- 1. Cho phép tất cả mọi người (kể cả khách chưa đăng nhập) được ĐỌC bài hát công khai
CREATE POLICY "Cho phép đọc bài hát công khai" 
ON public.songs FOR SELECT 
USING (true);

-- 2. CHỈ DUY NHẤT Admin buil14955@gmail.com ĐƯỢC THÊM BÀI HÁT
CREATE POLICY "Chỉ Admin buil14955 được thêm bài hát" 
ON public.songs FOR INSERT 
WITH CHECK (
  auth.jwt() ->> 'email' = 'buil14955@gmail.com'
);

-- 3. CHỈ DUY NHẤT Admin buil14955@gmail.com ĐƯỢC SỬA BÀI HÁT
CREATE POLICY "Chỉ Admin buil14955 được sửa bài hát" 
ON public.songs FOR UPDATE 
USING (
  auth.jwt() ->> 'email' = 'buil14955@gmail.com'
);

-- 4. CHỈ DUY NHẤT Admin buil14955@gmail.com ĐƯỢC XÓA BÀI HÁT
CREATE POLICY "Chỉ Admin buil14955 được xóa bài hát" 
ON public.songs FOR DELETE 
USING (
  auth.jwt() ->> 'email' = 'buil14955@gmail.com'
);

-- 5. Quyền cho bảng favorites: Người dùng quản lý bài hát yêu thích của chính mình
DROP POLICY IF EXISTS "Người dùng quản lý bài hát yêu thích của mình" ON public.favorites;
CREATE POLICY "Người dùng quản lý bài hát yêu thích của mình"
ON public.favorites FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Quyền cho bảng playlists: Xem công khai hoặc của chính mình, người dùng quản lý playlist của mình
DROP POLICY IF EXISTS "Cho phép xem playlist công khai hoặc của mình" ON public.playlists;
CREATE POLICY "Cho phép xem playlist công khai hoặc của mình"
ON public.playlists FOR SELECT
USING (is_public = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Người dùng tạo playlist của mình" ON public.playlists;
CREATE POLICY "Người dùng tạo playlist của mình"
ON public.playlists FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Người dùng sửa playlist của mình" ON public.playlists;
CREATE POLICY "Người dùng sửa playlist của mình"
ON public.playlists FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Người dùng xóa playlist của mình" ON public.playlists;
CREATE POLICY "Người dùng xóa playlist của mình"
ON public.playlists FOR DELETE
USING (auth.uid() = user_id);

-- 7. Quyền cho bảng playlist_songs
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Xem bài hát trong playlist" ON public.playlist_songs;
CREATE POLICY "Xem bài hát trong playlist"
ON public.playlist_songs FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Thêm bài hát vào playlist của mình" ON public.playlist_songs;
CREATE POLICY "Thêm bài hát vào playlist của mình"
ON public.playlist_songs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.playlists
    WHERE id = playlist_id AND user_id = auth.uid()
  )
);

-- 8. Quyền cho bảng Chat Cộng Đồng (community_messages)
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Đọc tin nhắn cộng đồng công khai" ON public.community_messages;
CREATE POLICY "Đọc tin nhắn cộng đồng công khai"
ON public.community_messages FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Thành viên gửi tin nhắn" ON public.community_messages;
CREATE POLICY "Thành viên gửi tin nhắn"
ON public.community_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin quản lý ghim tin nhắn" ON public.community_messages;
CREATE POLICY "Admin quản lý ghim tin nhắn"
ON public.community_messages FOR UPDATE
USING (auth.jwt() ->> 'email' = 'buil14955@gmail.com');

DROP POLICY IF EXISTS "Admin và chính chủ xóa tin nhắn" ON public.community_messages;
CREATE POLICY "Admin và chính chủ xóa tin nhắn"
ON public.community_messages FOR DELETE
USING (
  auth.jwt() ->> 'email' = 'buil14955@gmail.com' OR 
  auth.uid() = user_id
);

-- Kích hoạt Realtime cho bảng community_messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'community_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
  END IF;
END $$;

-- =====================================================================
-- TẠO STORAGE BUCKET CHO AUDIO MP3 & ẢNH BÌA (BẢO VỆ BỞI ADMIN)
-- =====================================================================

-- Tạo bucket 'music' công khai nếu chưa có
INSERT INTO storage.buckets (id, name, public) 
VALUES ('music', 'music', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Xóa policy cũ nếu có
DROP POLICY IF EXISTS "Cho phép nghe nhạc và xem ảnh công khai" ON storage.objects;
DROP POLICY IF EXISTS "Cho phép upload nhạc và ảnh bìa" ON storage.objects;
DROP POLICY IF EXISTS "Chỉ Admin buil14955 được upload file" ON storage.objects;
DROP POLICY IF EXISTS "Cho phép xóa file" ON storage.objects;
DROP POLICY IF EXISTS "Chỉ Admin buil14955 được xóa file" ON storage.objects;

-- 1. Cho phép đọc file công khai từ bucket 'music' (nghe nhạc và xem ảnh bìa)
CREATE POLICY "Cho phép nghe nhạc và xem ảnh công khai"
ON storage.objects FOR SELECT
USING (bucket_id = 'music');

-- 2. CHỈ DUY NHẤT Admin buil14955@gmail.com ĐƯỢC UPLOAD FILE VÀO BUCKET 'music'
CREATE POLICY "Chỉ Admin buil14955 được upload file"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'music' AND
  auth.jwt() ->> 'email' = 'buil14955@gmail.com'
);

-- 3. CHỈ DUY NHẤT Admin buil14955@gmail.com ĐƯỢC XÓA FILE TRONG BUCKET 'music'
CREATE POLICY "Chỉ Admin buil14955 được xóa file"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'music' AND
  auth.jwt() ->> 'email' = 'buil14955@gmail.com'
);
