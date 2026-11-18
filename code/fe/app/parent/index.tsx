import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useParentStore, useSelectedChild } from "../../store/parentStore";
import { ChildInfo } from "../../types/parent";
import SideMenu from "@/components/SideMenu";
import { AdminPageWrapper } from "../../components/ui/AdminPageWrapper";
import { useChildOverview } from "../../components/parent/useChildOverview";
import {
  EmptyLine,
  FloatingBody,
  HeroChip,
  HeroProfileCard,
  HomeHero,
  LessonTimeline,
  PRIMARY,
  SectionCard,
  ShortcutGrid,
  ShortcutItem,
  StatTile,
  formatMoney,
  greeting,
} from "../../components/home/HomeParts";

const SHORTCUTS: ShortcutItem[] = [
  { icon: "stats-chart", label: "Kết quả", route: "/parent/results", color: "#F97316", bg: "bg-orange-50" },
  { icon: "calendar", label: "Điểm danh", route: "/parent/attendance", color: "#F43F5E", bg: "bg-rose-50" },
  { icon: "time", label: "Lịch học", route: "/parent/timetable", color: "#D97706", bg: "bg-amber-50" },
  { icon: "document-text", label: "Lịch thi", route: "/parent/exam-schedule", color: "#6366F1", bg: "bg-indigo-50" },
  { icon: "card", label: "Học phí", route: "/parent/fees", color: "#14B8A6", bg: "bg-teal-50" },
  { icon: "chatbubbles", label: "Tin nhắn", route: "/parent/chat", color: "#06B6D4", bg: "bg-cyan-50" },
  { icon: "sparkles", label: "AI Chat", route: "/parent/ai-chat", color: "#8B5CF6", bg: "bg-violet-50" },
];

/** Ảnh học sinh: bo góc vuông mềm (khác ảnh tròn của tài khoản) và có huy hiệu mũ tốt nghiệp. */
function Avatar({ child, size, badge = true }: { child: ChildInfo; size: number; badge?: boolean }) {
  const initial = (child.fullName ?? "?").trim().split(" ").at(-1)?.[0]?.toUpperCase() ?? "?";
  const radius = size * 0.3;
  return (
    <View style={{ width: size, height: size }}>
      {child.avatarUrl ? (
        <Image
          source={{ uri: child.avatarUrl }}
          style={{ width: size, height: size, borderRadius: radius }}
          contentFit="cover"
        />
      ) : (
        <View
          className="bg-white/25 items-center justify-center"
          style={{ width: size, height: size, borderRadius: radius }}
        >
          <Text style={{ fontFamily: "Poppins-Bold", fontSize: size * 0.4 }} className="text-white">
            {initial}
          </Text>
        </View>
      )}
      {badge && (
        <View
          className="absolute bg-amber-400 items-center justify-center border-2 border-[#136ADA]"
          style={{ right: -6, bottom: -6, width: size * 0.38, height: size * 0.38, borderRadius: size * 0.19 }}
        >
          <Ionicons name="school" size={size * 0.2} color="white" />
        </View>
      )}
    </View>
  );
}

function givenName(child: ChildInfo | null) {
  return child?.fullName?.trim().split(" ").at(-1) ?? "con";
}

export default function ParentDashboard() {
  const { userInfo } = useAuthStore();
  const { children, selectChild, isLoading, loadChildren } = useParentStore();
  const child = useSelectedChild();
  const overview = useChildOverview(child);
  const [isMenuVisible, setMenuVisible] = useState(false);

  const selectedIndex = children.findIndex((c) => c.studentId === child?.studentId);
  const refreshing = isLoading || overview.loading;

  const onRefresh = () => {
    loadChildren();
    overview.reload();
  };

  return (
    <AdminPageWrapper
      showLogo={true}
      leftComponent={
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu-outline" size={28} color="black" />
        </TouchableOpacity>
      }
      rightComponent={
        <TouchableOpacity onPress={() => router.push("/parent/notifications" as any)}>
          <Ionicons name="notifications-outline" size={28} color="black" />
        </TouchableOpacity>
      }
    >
      <StatusBar hidden />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Hero: tài khoản phụ huynh + con đang xem */}
        <HomeHero
          eyebrow={`${greeting()} 👋`}
          right={children.length > 0 ? <HeroChip icon="people" label={`${children.length} con`} /> : undefined}
        >
          <HeroProfileCard
            name={userInfo?.fullName ?? "Phụ huynh"}
            avatarUrl={userInfo?.avatarUrl}
            label="Phụ huynh"
            subtitle={userInfo?.email}
          />

          {isLoading && children.length === 0 ? (
            <View className="py-8">
              <ActivityIndicator color="white" />
            </View>
          ) : child ? (
            <View className="mt-4 bg-white/15 rounded-3xl p-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <Ionicons name="heart" size={12} color="#FCD34D" />
                  <Text
                    style={{ fontFamily: "Poppins-SemiBold" }}
                    className="text-amber-200 text-[10px] ml-1.5 uppercase tracking-widest"
                  >
                    Con của bạn
                  </Text>
                </View>
                {children.length > 1 && (
                  <Text style={{ fontFamily: "Poppins-Medium" }} className="text-white/70 text-[10px]">
                    {selectedIndex + 1} / {children.length}
                  </Text>
                )}
              </View>
              <View className="flex-row items-center">
                <Avatar child={child} size={60} />
                <View className="ml-4 flex-1">
                  <Text numberOfLines={1} style={{ fontFamily: "Poppins-Bold" }} className="text-white text-xl">
                    {child.fullName ?? "Học sinh"}
                  </Text>
                  <Text style={{ fontFamily: "Poppins-Medium" }} className="text-white/80 text-xs">
                    Học sinh • {child.className ? `Lớp ${child.className}` : "Chưa có lớp"}
                    {child.grade ? ` • Khối ${child.grade}` : ""}
                  </Text>
                  {child.relationship ? (
                    <Text style={{ fontFamily: "Poppins-Regular" }} className="text-white/60 text-[10px] mt-0.5">
                      Bạn là: {child.relationship}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          ) : (
            <View className="mt-4 bg-white/15 rounded-3xl p-5">
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-white text-xs">
                Tài khoản chưa được gắn với học sinh nào. Vui lòng liên hệ nhà trường.
              </Text>
            </View>
          )}

          {children.length > 1 && (
            <View className="mt-4">
              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-white/70 text-[10px] mb-2 uppercase tracking-widest"
              >
                Chuyển sang con khác
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {children.map((c) => {
                  const active = c.studentId === child?.studentId;
                  return (
                    <TouchableOpacity
                      key={c.studentId}
                      onPress={() => selectChild(c.studentId)}
                      className={`flex-row items-center pl-2 pr-4 py-2 rounded-2xl ${
                        active ? "bg-white" : "bg-white/15"
                      }`}
                    >
                      <Avatar child={c} size={32} badge={false} />
                      <View className="ml-2.5">
                        <Text
                          numberOfLines={1}
                          style={{ fontFamily: "Poppins-SemiBold" }}
                          className={`text-xs ${active ? "text-[#136ADA]" : "text-white"}`}
                        >
                          {givenName(c)}
                        </Text>
                        <Text
                          style={{ fontFamily: "Poppins-Regular" }}
                          className={`text-[10px] ${active ? "text-gray-400" : "text-white/70"}`}
                        >
                          {c.className ? `Lớp ${c.className}` : "Chưa có lớp"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </HomeHero>

        {child && (
          <FloatingBody>
            {/* Hai chỉ số nhanh */}
            <View className="flex-row gap-3">
              <StatTile
                icon="calendar"
                label="Điểm danh tháng này"
                onPress={() => router.push("/parent/attendance" as any)}
                loading={overview.loading && !overview.attendance}
                value={overview.attendance ? `${Math.round(overview.attendance.percentage)}%` : "—"}
                sub={
                  overview.attendance
                    ? `${overview.attendance.present} có mặt • ${overview.attendance.absent} vắng`
                    : "Chưa có dữ liệu"
                }
                tone={!overview.attendance ? "neutral" : overview.attendance.percentage >= 90 ? "good" : "warn"}
              />
              <StatTile
                icon="card"
                label="Học phí còn nợ"
                onPress={() => router.push("/parent/fees" as any)}
                loading={overview.loading && !overview.fees}
                value={
                  !overview.fees
                    ? "—"
                    : overview.fees.unpaidCount === 0
                      ? "Đã đủ"
                      : formatMoney(overview.fees.unpaidAmount)
                }
                sub={
                  !overview.fees
                    ? "Chưa có dữ liệu"
                    : overview.fees.unpaidCount === 0
                      ? "Không có khoản nào"
                      : `${overview.fees.unpaidCount} khoản chưa đóng`
                }
                tone={!overview.fees ? "neutral" : overview.fees.unpaidCount === 0 ? "good" : "bad"}
              />
            </View>

            {/* Hôm nay con học */}
            <SectionCard
              title={`Hôm nay ${givenName(child)} học`}
              actionLabel="Cả tuần"
              onAction={() => router.push("/parent/timetable" as any)}
            >
              {overview.loading && overview.todayLessons === null ? (
                <ActivityIndicator color={PRIMARY} />
              ) : overview.todayLessons === null ? (
                <EmptyLine text="Không tải được thời khóa biểu." />
              ) : overview.todayLessons.length === 0 ? (
                <EmptyLine text={`Hôm nay ${givenName(child)} không có tiết học nào.`} />
              ) : (
                <LessonTimeline
                  lessons={overview.todayLessons.map((l) => ({
                    id: l.scheduleDetailId,
                    subjectName: l.subjectName,
                    startTime: l.startTime,
                    finishTime: l.finishTime,
                    timeRange: l.timeRange,
                    extra: [l.roomName, l.teacherName].filter(Boolean).join(" • "),
                  }))}
                />
              )}
            </SectionCard>

            {/* Lịch thi sắp tới */}
            {overview.nextExam && (
              <TouchableOpacity
                onPress={() => router.push("/parent/exam-schedule" as any)}
                className="mt-4 bg-indigo-50 rounded-3xl p-5 flex-row items-center"
              >
                <View className="w-12 h-12 rounded-2xl bg-white items-center justify-center">
                  <Ionicons name="document-text" size={22} color="#6366F1" />
                </View>
                <View className="ml-4 flex-1">
                  <Text
                    style={{ fontFamily: "Poppins-SemiBold" }}
                    className="text-indigo-500 text-[10px] uppercase tracking-widest"
                  >
                    Lịch thi sắp tới
                  </Text>
                  <Text numberOfLines={1} style={{ fontFamily: "Poppins-Bold" }} className="text-gray-800 text-base">
                    {overview.nextExam.subjectName}
                  </Text>
                  <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-xs">
                    {new Date(overview.nextExam.date).toLocaleDateString("vi-VN")} •{" "}
                    {overview.nextExam.startTime.slice(0, 5)} • {overview.nextExam.roomName}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#6366F1" />
              </TouchableOpacity>
            )}
          </FloatingBody>
        )}

        <ShortcutGrid items={SHORTCUTS} />
      </ScrollView>

      <SideMenu visible={isMenuVisible} onClose={() => setMenuVisible(false)} />
    </AdminPageWrapper>
  );
}
