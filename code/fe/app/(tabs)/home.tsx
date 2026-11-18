import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import SideMenu from "@/components/SideMenu";
import { useConfigStore } from "../../store/configStore";
import { useAuthStore } from "../../store/authStore";
import { AdminPageWrapper } from "../../components/ui/AdminPageWrapper";
import { useStudentOverview } from "../../components/home/useStudentOverview";
import {
  EmptyLine,
  FloatingBody,
  HeroChip,
  HeroProfileCard,
  HomeHero,
  LessonTimeline,
  ListRow,
  PRIMARY,
  SectionCard,
  ShortcutGrid,
  ShortcutItem,
  StatTile,
  formatMoney,
  greeting,
} from "../../components/home/HomeParts";

const SHORTCUTS: ShortcutItem[] = [
  { icon: "document-text-outline", label: "Bài tập", route: "/student/assignments", color: "#14B8A6", bg: "bg-teal-50" },
  { icon: "pie-chart-outline", label: "Kết quả", route: "/student/results", color: "#EAB308", bg: "bg-yellow-50" },
  { icon: "time-outline", label: "Lịch học", route: "/(tabs)/timetable", color: "#3B82F6", bg: "bg-blue-50" },
  { icon: "calendar-outline", label: "Lịch thi", route: "/student/exam-schedule", color: "#F97316", bg: "bg-orange-50" },
  { icon: "cash-outline", label: "Học phí", route: "/student/payment", color: "#A855F7", bg: "bg-purple-50" },
  { icon: "megaphone-outline", label: "Sự kiện", route: "/events", color: "#F43F5E", bg: "bg-rose-50" },
  { icon: "file-tray-full-outline", label: "Khóa học", route: "/student/courses", color: "#4F46E5", bg: "bg-indigo-50" },
  { icon: "bookmark-outline", label: "Khóa của tôi", route: "/student/courses/registered", color: "#A855F7", bg: "bg-purple-50" },
  { icon: "sparkles-outline", label: "AI Chat", route: "/student/ai-chat", color: "#8B5CF6", bg: "bg-violet-50" },
];

function daysLeftLabel(finishTime: string) {
  const days = Math.ceil((new Date(finishTime).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return "Quá hạn";
  if (days === 0) return "Hạn hôm nay";
  return `Còn ${days} ngày`;
}

export default function HomeScreen() {
  const [isMenuVisible, setMenuVisible] = useState(false);
  const { schoolYear, term } = useConfigStore();
  const { userInfo } = useAuthStore();
  const overview = useStudentOverview();

  const pending = overview.pendingAssignments;

  return (
    <AdminPageWrapper
      showLogo={true}
      leftComponent={
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu-outline" size={28} color="black" />
        </TouchableOpacity>
      }
      rightComponent={
        <TouchableOpacity onPress={() => router.push("/student/notifications" as any)}>
          <Ionicons name="notifications-outline" size={28} color="black" />
        </TouchableOpacity>
      }
    >
      <StatusBar hidden />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={overview.loading} onRefresh={overview.reload} />}
      >
        <HomeHero
          eyebrow={`${greeting()} 👋`}
          right={<HeroChip icon="calendar" label={`Năm học ${schoolYear} • HK${term}`} />}
        >
          <HeroProfileCard
            name={userInfo?.fullName ?? "Học sinh"}
            avatarUrl={userInfo?.avatarUrl}
            label="Học sinh"
            subtitle={overview.className ? `Lớp ${overview.className}` : "Chưa có lớp"}
          />
        </HomeHero>

        <FloatingBody>
          <View className="flex-row gap-3">
            <StatTile
              icon="document-text"
              label="Bài tập cần làm"
              onPress={() => router.push("/student/assignments" as any)}
              loading={overview.loading && pending === null}
              value={pending === null ? "—" : String(pending.length)}
              sub={
                pending === null
                  ? "Chưa có dữ liệu"
                  : pending.length === 0
                    ? "Bạn đã hoàn thành hết"
                    : `Gần nhất: ${daysLeftLabel(pending[0].finishTime).toLowerCase()}`
              }
              tone={pending === null ? "neutral" : pending.length === 0 ? "good" : "warn"}
            />
            <StatTile
              icon="calendar"
              label="Điểm danh tháng này"
              onPress={() => router.push("/(tabs)/attendance" as any)}
              loading={overview.loading && !overview.attendance}
              value={overview.attendance ? `${Math.round(overview.attendance.percentage)}%` : "—"}
              sub={
                overview.attendance
                  ? `${overview.attendance.present} có mặt • ${overview.attendance.absent} vắng`
                  : "Chưa có dữ liệu"
              }
              tone={!overview.attendance ? "neutral" : overview.attendance.percentage >= 90 ? "good" : "warn"}
            />
          </View>

          {/* Hôm nay học */}
          <SectionCard title="Hôm nay bạn học" actionLabel="Cả tuần" onAction={() => router.push("/(tabs)/timetable" as any)}>
            {overview.loading && overview.todayLessons === null ? (
              <ActivityIndicator color={PRIMARY} />
            ) : overview.todayLessons === null ? (
              <EmptyLine text="Không tải được thời khóa biểu." />
            ) : overview.todayLessons.length === 0 ? (
              <EmptyLine text="Hôm nay bạn không có tiết học nào." />
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

          {/* Bài tập sắp đến hạn */}
          <SectionCard
            title="Bài tập sắp đến hạn"
            actionLabel="Xem tất cả"
            onAction={() => router.push("/student/assignments" as any)}
          >
            {pending === null ? (
              <EmptyLine text="Không tải được bài tập." />
            ) : pending.length === 0 ? (
              <EmptyLine text="Không có bài tập đến hạn." />
            ) : (
              pending.slice(0, 3).map((a, i, arr) => (
                <ListRow
                  key={a.assignmentId}
                  icon="clipboard-outline"
                  iconColor={PRIMARY}
                  iconBg="bg-blue-50"
                  title={a.title}
                  subtitle={`${a.subjectName} • ${daysLeftLabel(a.finishTime)}`}
                  last={i === arr.length - 1}
                  onPress={() => router.push(`/student/assignments/${a.assignmentId}` as any)}
                />
              ))
            )}
          </SectionCard>

          {/* Học phí + lịch thi */}
          {overview.fees && overview.fees.unpaidCount > 0 && (
            <TouchableOpacity
              onPress={() => router.push("/student/payment" as any)}
              className="mt-4 bg-rose-50 rounded-3xl p-5 flex-row items-center"
            >
              <View className="w-12 h-12 rounded-2xl bg-white items-center justify-center">
                <Ionicons name="cash" size={22} color="#F43F5E" />
              </View>
              <View className="ml-4 flex-1">
                <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-rose-500 text-[10px] uppercase tracking-widest">
                  Học phí còn nợ
                </Text>
                <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-800 text-base">
                  {formatMoney(overview.fees.unpaidAmount)}
                </Text>
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-xs">
                  {overview.fees.unpaidCount} khoản chưa đóng
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#F43F5E" />
            </TouchableOpacity>
          )}

          {overview.nextExam && (
            <TouchableOpacity
              onPress={() => router.push("/student/exam-schedule" as any)}
              className="mt-4 bg-indigo-50 rounded-3xl p-5 flex-row items-center"
            >
              <View className="w-12 h-12 rounded-2xl bg-white items-center justify-center">
                <Ionicons name="document-text" size={22} color="#6366F1" />
              </View>
              <View className="ml-4 flex-1">
                <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-indigo-500 text-[10px] uppercase tracking-widest">
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

          {/* Sự kiện */}
          {overview.nextEvent && (
            <TouchableOpacity
              onPress={() => router.push("/events" as any)}
              className="mt-4 bg-amber-50 rounded-3xl p-5 flex-row items-center"
            >
              <View className="w-12 h-12 rounded-2xl bg-white items-center justify-center">
                <Ionicons name="megaphone" size={22} color="#D97706" />
              </View>
              <View className="ml-4 flex-1">
                <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-amber-600 text-[10px] uppercase tracking-widest">
                  Sự kiện
                </Text>
                <Text numberOfLines={1} style={{ fontFamily: "Poppins-Bold" }} className="text-gray-800 text-base">
                  {overview.nextEvent.title}
                </Text>
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-xs">
                  {new Date(overview.nextEvent.eventDate).toLocaleDateString("vi-VN")}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#D97706" />
            </TouchableOpacity>
          )}
        </FloatingBody>

        <ShortcutGrid title="Tiện ích học tập" items={SHORTCUTS} />
      </ScrollView>
      <SideMenu visible={isMenuVisible} onClose={() => setMenuVisible(false)} />
    </AdminPageWrapper>
  );
}
