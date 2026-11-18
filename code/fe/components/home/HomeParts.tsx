import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ReactNode } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

/**
 * Các thành phần dùng chung cho trang chủ của mọi role
 * (khối xanh ở đầu, ô chỉ số nổi, thẻ tóm tắt, lối tắt dạng biểu tượng).
 */

export const PRIMARY = "#136ADA";

export function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Chào buổi sáng";
  if (h < 14) return "Chào buổi trưa";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

export function formatMoney(amount: number) {
  return `${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}đ`;
}

/** "08:30:00" -> số phút từ 0h, để so sánh với giờ hiện tại. */
export function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

/** Khối xanh bo tròn ở đầu trang. Nội dung chính nên bọc bằng <FloatingBody> để nổi lên trên khối này. */
export function HomeHero({
  eyebrow,
  title,
  subtitle,
  right,
  children,
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <View className="px-6 pt-5 pb-16 rounded-b-[36px]" style={{ backgroundColor: PRIMARY }}>
      {(eyebrow || title || right) && (
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            {eyebrow ? (
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-white/80 text-xs">
                {eyebrow}
              </Text>
            ) : null}
            {title ? (
              <Text numberOfLines={1} style={{ fontFamily: "Poppins-Bold" }} className="text-white text-2xl">
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text style={{ fontFamily: "Poppins-Regular" }} className="text-white/80 text-xs mt-0.5">
                {subtitle}
              </Text>
            ) : null}
          </View>
          {right}
        </View>
      )}
      {children}
    </View>
  );
}

/** Chip bo tròn trong suốt đặt trên khối xanh (ví dụ "2 con", "Năm học 2026"). */
export function HeroChip({ icon, label }: { icon: string; label: string }) {
  return (
    <View className="flex-row items-center bg-white/20 px-3 py-1.5 rounded-full">
      <Ionicons name={icon as any} size={14} color="white" />
      <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-white text-[11px] ml-1.5">
        {label}
      </Text>
    </View>
  );
}

/** Thẻ hồ sơ trong khối xanh: ảnh đại diện + tên nổi bật (dùng cho tài khoản học sinh). */
export function HeroProfileCard({
  name,
  avatarUrl,
  label,
  subtitle,
}: {
  name: string;
  avatarUrl?: string | null;
  label: string;
  subtitle?: string;
}) {
  const initial = name.trim().split(" ").at(-1)?.[0]?.toUpperCase() ?? "?";
  return (
    <View className="mt-4 bg-white/15 rounded-3xl p-4 flex-row items-center">
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: "rgba(255,255,255,0.6)" }}
          contentFit="cover"
        />
      ) : (
        <View
          className="bg-white/25 items-center justify-center"
          style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: "rgba(255,255,255,0.6)" }}
        >
          <Text style={{ fontFamily: "Poppins-Bold", fontSize: 26 }} className="text-white">
            {initial}
          </Text>
        </View>
      )}
      <View className="ml-4 flex-1">
        <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-amber-200 text-[10px] uppercase tracking-widest">
          {label}
        </Text>
        <Text numberOfLines={1} style={{ fontFamily: "Poppins-Bold" }} className="text-white text-xl">
          {name}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={{ fontFamily: "Poppins-Medium" }} className="text-white/80 text-xs">
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/** Phần thân nổi lên đè lên khối xanh. */
export function FloatingBody({ children }: { children: ReactNode }) {
  return <View className="px-6 -mt-10">{children}</View>;
}

export const TONES = {
  good: { bg: "bg-emerald-50", icon: "#10B981", value: "text-emerald-600" },
  warn: { bg: "bg-amber-50", icon: "#F59E0B", value: "text-amber-600" },
  bad: { bg: "bg-rose-50", icon: "#F43F5E", value: "text-rose-600" },
  info: { bg: "bg-blue-50", icon: PRIMARY, value: "text-[#136ADA]" },
  neutral: { bg: "bg-gray-50", icon: "#9CA3AF", value: "text-gray-500" },
} as const;

export type Tone = keyof typeof TONES;

export function StatTile({
  icon,
  label,
  value,
  sub,
  tone,
  loading,
  onPress,
}: {
  icon: string;
  label: string;
  value: string;
  sub: string;
  tone: Tone;
  loading?: boolean;
  onPress?: () => void;
}) {
  const t = TONES[tone];
  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      className="flex-1 bg-white rounded-3xl p-4 shadow-lg shadow-gray-200"
    >
      <View className={`w-9 h-9 rounded-xl items-center justify-center ${t.bg}`}>
        <Ionicons name={icon as any} size={18} color={t.icon} />
      </View>
      <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px] mt-3" numberOfLines={1}>
        {label}
      </Text>
      {loading ? (
        <ActivityIndicator size="small" color={PRIMARY} style={{ alignSelf: "flex-start", marginVertical: 6 }} />
      ) : (
        <Text style={{ fontFamily: "Poppins-Bold" }} className={`text-xl ${t.value}`} numberOfLines={1}>
          {value}
        </Text>
      )}
      <Text style={{ fontFamily: "Poppins-Regular" }} className="text-gray-400 text-[10px]" numberOfLines={1}>
        {sub}
      </Text>
    </TouchableOpacity>
  );
}

export function SectionCard({
  title,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
}) {
  return (
    <View className="mt-4 bg-white rounded-3xl p-5 shadow-lg shadow-gray-200">
      <View className="flex-row items-center justify-between mb-4">
        <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-800 text-base">
          {title}
        </Text>
        {actionLabel && (
          <TouchableOpacity onPress={onAction}>
            <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-[#136ADA] text-xs">
              {actionLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );
}

export function EmptyLine({ text }: { text: string }) {
  return (
    <Text style={{ fontFamily: "Poppins-Regular" }} className="text-gray-400 text-xs">
      {text}
    </Text>
  );
}

/** Một dòng trong danh sách (biểu tượng + tiêu đề + mô tả + mũi tên). */
export function ListRow({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  onPress,
  last,
}: {
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      className={`flex-row items-center py-3 ${last ? "" : "border-b border-gray-50"}`}
    >
      <View className={`w-10 h-10 rounded-2xl items-center justify-center mr-3 ${iconBg}`}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text numberOfLines={1} style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-800 text-sm">
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={{ fontFamily: "Poppins-Regular" }} className="text-gray-400 text-xs">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={16} color="#9CA3AF" /> : null}
    </TouchableOpacity>
  );
}

export interface ShortcutItem {
  icon: string;
  label: string;
  route: string;
  color: string;
  bg: string;
}

/** Lưới lối tắt dạng biểu tượng, 4 cột. */
export function ShortcutGrid({ title = "Tiện ích", items }: { title?: string; items: ShortcutItem[] }) {
  return (
    <View className="px-6 mt-6 pb-12">
      <Text
        style={{ fontFamily: "Poppins-SemiBold" }}
        className="text-gray-500 text-xs mb-4 uppercase tracking-widest"
      >
        {title}
      </Text>
      <View className="flex-row flex-wrap">
        {items.map((s) => (
          <TouchableOpacity
            key={s.route + s.label}
            onPress={() => router.push(s.route as any)}
            className="items-center mb-5"
            style={{ width: "25%" }}
          >
            <View className={`w-14 h-14 rounded-2xl items-center justify-center ${s.bg}`}>
              <Ionicons name={s.icon as any} size={24} color={s.color} />
            </View>
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-700 text-[11px] mt-2 text-center"
              numberOfLines={1}
            >
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

/** Dòng thời gian các tiết học trong ngày; tự đánh dấu "Đang học" / "Tiếp theo". */
export function LessonTimeline({
  lessons,
}: {
  lessons: { id: string; subjectName: string; startTime: string; finishTime: string; timeRange: string; extra?: string }[];
}) {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const firstUpcomingIdx = lessons.findIndex((l) => toMinutes(l.finishTime) > nowMin);

  return (
    <View>
      {lessons.map((l, i) => {
        const start = toMinutes(l.startTime);
        const end = toMinutes(l.finishTime);
        const ongoing = nowMin >= start && nowMin < end;
        const next = !ongoing && i === firstUpcomingIdx;
        const done = end <= nowMin;
        return (
          <View key={l.id} className="flex-row">
            <View className="items-center mr-4">
              <View
                className={`w-3 h-3 rounded-full mt-1.5 ${
                  ongoing ? "bg-[#136ADA]" : next ? "bg-amber-400" : done ? "bg-gray-300" : "bg-blue-200"
                }`}
              />
              {i < lessons.length - 1 && <View className="w-[2px] flex-1 bg-gray-100 my-1" />}
            </View>
            <View className={`flex-1 pb-4 ${done ? "opacity-50" : ""}`}>
              <View className="flex-row items-center justify-between">
                <Text
                  numberOfLines={1}
                  style={{ fontFamily: "Poppins-SemiBold" }}
                  className="text-gray-800 text-sm flex-1 mr-2"
                >
                  {l.subjectName}
                </Text>
                {(ongoing || next) && (
                  <View className={`px-2 py-0.5 rounded-full ${ongoing ? "bg-blue-50" : "bg-amber-50"}`}>
                    <Text
                      style={{ fontFamily: "Poppins-SemiBold" }}
                      className={`text-[9px] ${ongoing ? "text-[#136ADA]" : "text-amber-600"}`}
                    >
                      {ongoing ? "Đang học" : "Tiếp theo"}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={{ fontFamily: "Poppins-Regular" }} className="text-gray-400 text-xs">
                {l.timeRange}
                {l.extra ? ` • ${l.extra}` : ""}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
