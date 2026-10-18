// Danh mục tâm trạng & hoàn cảnh chuẩn của MoodMix (dùng để lọc và gán tag bài hát)
export const moodTags = [
  { id: 'all', labelVi: 'Cho bạn', labelEn: 'For You' },
  { id: 'trending', labelVi: 'Trending', labelEn: 'Trending' },
  { id: 'chill', labelVi: 'Thư giãn', labelEn: 'Chill & Relax' },
  { id: 'workout', labelVi: 'Tập luyện', labelEn: 'Workout' },
  { id: 'party', labelVi: 'Tiệc tùng', labelEn: 'Party' },
  { id: 'melancholic', labelVi: 'Tâm trạng', labelEn: 'Moody' },
  { id: 'sleep', labelVi: 'Ngủ ngon', labelEn: 'Sleep' },
  { id: 'focus', labelVi: 'Làm việc', labelEn: 'Focus & Work' },
  { id: 'romantic', labelVi: 'Lãng mạn', labelEn: 'Romantic' },
];

export const moodMetadata = {
  chill: { labelVi: 'Thư giãn', color: '#06b6d4', icon: '😌' },
  workout: { labelVi: 'Tập luyện', color: '#f59e0b', icon: '⚡' },
  party: { labelVi: 'Tiệc tùng', color: '#ec4899', icon: '🎉' },
  melancholic: { labelVi: 'Tâm trạng', color: '#64748b', icon: '🌧️' },
  sleep: { labelVi: 'Ngủ ngon', color: '#818cf8', icon: '🌙' },
  focus: { labelVi: 'Làm việc', color: '#10b981', icon: '🎯' },
  romantic: { labelVi: 'Lãng mạn', color: '#f43f5e', icon: '💖' },
  trending: { labelVi: 'Xu hướng', color: '#a855f7', icon: '🔥' }
};
