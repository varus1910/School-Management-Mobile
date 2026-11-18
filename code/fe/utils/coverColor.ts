/** Màu ảnh bìa theo tên (môn học/khóa học), để cùng một môn luôn ra cùng một màu. */
export const COVER_COLORS = ["#136ADA", "#6366F1", "#14B8A6", "#F97316", "#EC4899", "#8B5CF6"];

export function coverColorFor(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return COVER_COLORS[h % COVER_COLORS.length];
}
