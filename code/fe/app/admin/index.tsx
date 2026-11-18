import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AdminPageWrapper } from "../../components/ui/AdminPageWrapper";
import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "../../store/authStore";
import { useConfigStore } from "../../store/configStore";
import SideMenu from "../../components/SideMenu";
import { dashboardService } from "../../services/dashboard.service";
import { DashboardStats } from "../../types/dashboard";
import { reportGenerator } from "../../utils/reportGenerator";
import {
  FloatingBody,
  HeroChip,
  HomeHero,
  ListRow,
  SectionCard,
  ShortcutGrid,
  ShortcutItem,
  StatTile,
  formatMoney,
  greeting,
} from "../../components/home/HomeParts";

const QUICK_ACTIONS: ShortcutItem[] = [
  { label: "Người dùng", icon: "people-outline", color: "#136ADA", bg: "bg-blue-50", route: "/admin/users" },
  { label: "Vai trò", icon: "shield-outline", color: "#A855F7", bg: "bg-purple-50", route: "/admin/roles" },
  { label: "Học sinh", icon: "school-outline", color: "#0ea5e9", bg: "bg-sky-50", route: "/admin/students" },
  { label: "Giáo viên", icon: "person-circle-outline", color: "#6366F1", bg: "bg-indigo-50", route: "/admin/teachers" },
  { label: "Phụ huynh", icon: "people-outline", color: "#06B6D4", bg: "bg-cyan-50", route: "/admin/parents" },
  { label: "Lớp học", icon: "business-outline", color: "#14B8A6", bg: "bg-teal-50", route: "/admin/class-years" },
  { label: "Môn học", icon: "book-outline", color: "#22C55E", bg: "bg-green-50", route: "/admin/subjects" },
  { label: "Lịch học", icon: "calendar-outline", color: "#D97706", bg: "bg-amber-50", route: "/admin/schedules" },
  { label: "Lịch thi", icon: "document-text-outline", color: "#EAB308", bg: "bg-yellow-50", route: "/admin/exam-schedules" },
  { label: "Học phí", icon: "cash-outline", color: "#F97316", bg: "bg-orange-50", route: "/admin/fees" },
  { label: "Sự kiện", icon: "megaphone-outline", color: "#F43F5E", bg: "bg-pink-50", route: "/admin/events" },
  { label: "Khóa học", icon: "journal-outline", color: "#E11D48", bg: "bg-rose-50", route: "/admin/courses" },
  { label: "AI Chat", icon: "sparkles-outline", color: "#059669", bg: "bg-emerald-50", route: "/admin/ai-chat" },
  { label: "Tin nhắn", icon: "chatbubbles-outline", color: "#06B6D4", bg: "bg-cyan-50", route: "/admin/chat" },
];

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  return (
    <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <View className={`h-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
    </View>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { userInfo } = useAuthStore();
  const { schoolYear } = useConfigStore();
  const adminName = userInfo?.fullName?.split(" ").at(-1) ?? "Quản trị viên";

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats(Number(schoolYear));
      setStats(data);
    } catch (err) {
      console.log("Error fetching admin stats:", err);
    } finally {
      setLoading(false);
    }
  }, [schoolYear]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const handleCreateReport = async () => {
    if (!stats) return;
    try {
      setIsGeneratingReport(true);
      await reportGenerator.generateAdminReport(stats, Number(schoolYear));
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tạo báo cáo PDF");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const COUNTS = [
    { label: "Học sinh", value: stats?.totalStudents ?? 0, icon: "people", color: "#136ADA", bg: "bg-blue-50" },
    { label: "Giáo viên", value: stats?.totalTeachers ?? 0, icon: "person", color: "#A855F7", bg: "bg-purple-50" },
    { label: "Lớp học", value: stats?.totalClasses ?? 0, icon: "school", color: "#14B8A6", bg: "bg-teal-50" },
    { label: "Môn học", value: stats?.totalSubjects ?? 0, icon: "book", color: "#F97316", bg: "bg-orange-50" },
  ];

  const collectedPercent =
    stats && stats.finance.totalExpectedRevenue > 0
      ? (stats.finance.totalCollectedRevenue / stats.finance.totalExpectedRevenue) * 100
      : 0;

  return (
    <AdminPageWrapper
      showLogo={true}
      leftComponent={
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu-outline" size={28} color="black" />
        </TouchableOpacity>
      }
      rightComponent={
        <TouchableOpacity onPress={() => router.push("/admin/notifications" as any)}>
          <Ionicons name="notifications-outline" size={28} color="black" />
        </TouchableOpacity>
      }
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <HomeHero
          eyebrow={`${greeting()} 👋`}
          title={`Quản trị viên ${adminName}`}
          subtitle={`Bảng điều khiển năm học ${schoolYear} - ${schoolYear + 1}`}
          right={<HeroChip icon="calendar" label={`${schoolYear}`} />}
        />

        <FloatingBody>
          {/* Hai chỉ số quan trọng nhất */}
          <View className="flex-row gap-3">
            <StatTile
              icon="cash"
              label="Học phí đã thu"
              loading={loading && !stats}
              onPress={() => router.push("/admin/fees" as any)}
              value={stats ? `${Math.round(collectedPercent)}%` : "—"}
              sub={stats ? formatMoney(stats.finance.totalCollectedRevenue) : "Chưa có dữ liệu"}
              tone={!stats ? "neutral" : collectedPercent >= 80 ? "good" : "warn"}
            />
            <StatTile
              icon="alert-circle"
              label="Học sinh nợ phí"
              loading={loading && !stats}
              onPress={() => router.push("/admin/fees" as any)}
              value={stats ? String(stats.finance.studentsWithOverdueFees) : "—"}
              sub={stats ? `Cần thu ${formatMoney(stats.finance.totalPendingRevenue)}` : "Chưa có dữ liệu"}
              tone={!stats ? "neutral" : stats.finance.studentsWithOverdueFees > 0 ? "bad" : "good"}
            />
          </View>

          {/* Tổng quan chung */}
          <SectionCard title="Tổng quan chung">
            <View className="flex-row justify-between">
              {COUNTS.map((c) => (
                <View key={c.label} className="items-center" style={{ width: "25%" }}>
                  <View className={`w-11 h-11 rounded-2xl items-center justify-center ${c.bg}`}>
                    <Ionicons name={c.icon as any} size={20} color={c.color} />
                  </View>
                  {loading && !refreshing && !stats ? (
                    <ActivityIndicator size="small" color={c.color} style={{ marginTop: 6 }} />
                  ) : (
                    <Text style={{ fontFamily: "Poppins-Bold", color: c.color }} className="text-lg mt-1">
                      {c.value}
                    </Text>
                  )}
                  <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-[10px]">
                    {c.label}
                  </Text>
                </View>
              ))}
            </View>
          </SectionCard>

          {stats && (
            <>
              {/* Doanh thu học phí */}
              <SectionCard title="Doanh thu học phí">
                <View className="flex-row items-end justify-between mb-2">
                  <Text style={{ fontFamily: "Poppins-Bold" }} className="text-xl text-orange-600">
                    {formatMoney(stats.finance.totalCollectedRevenue)}
                  </Text>
                  <Text style={{ fontFamily: "Poppins-Regular" }} className="text-gray-400 text-[10px]">
                    / {formatMoney(stats.finance.totalExpectedRevenue)}
                  </Text>
                </View>
                <ProgressBar percent={collectedPercent} color="bg-orange-500" />
              </SectionCard>

              {/* Chuyên cần & bài tập */}
              <SectionCard title="Hiệu suất">
                <View className="flex-row gap-6">
                  <View className="flex-1">
                    <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-400 text-[10px] uppercase">
                      Chuyên cần
                    </Text>
                    <Text style={{ fontFamily: "Poppins-Bold" }} className="text-xl text-teal-600 mt-1 mb-2">
                      {stats.attendance.overallAttendanceRate}%
                    </Text>
                    <ProgressBar percent={stats.attendance.overallAttendanceRate} color="bg-teal-500" />
                  </View>
                  <View className="flex-1">
                    <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-400 text-[10px] uppercase">
                      Bài tập hoàn thành
                    </Text>
                    <Text style={{ fontFamily: "Poppins-Bold" }} className="text-xl text-indigo-600 mt-1 mb-2">
                      {stats.academic.assignmentCompletionRate}%
                    </Text>
                    <ProgressBar percent={stats.academic.assignmentCompletionRate} color="bg-indigo-500" />
                  </View>
                </View>
              </SectionCard>

              {/* Hoạt động gần đây */}
              {stats.recentActivities.length > 0 && (
                <SectionCard
                  title="Hoạt động gần đây"
                  actionLabel="Xem tất cả"
                  onAction={() => router.push("/admin/activities" as any)}
                >
                  {stats.recentActivities.slice(0, 3).map((activity, index, arr) => (
                    <ListRow
                      key={index}
                      icon={
                        activity.type === "Payment"
                          ? "cash-outline"
                          : activity.type === "Submission"
                            ? "document-text-outline"
                            : "notifications-outline"
                      }
                      iconColor={
                        activity.type === "Payment" ? "#F97316" : activity.type === "Submission" ? "#3B82F6" : "#6B7280"
                      }
                      iconBg={
                        activity.type === "Payment"
                          ? "bg-orange-50"
                          : activity.type === "Submission"
                            ? "bg-blue-50"
                            : "bg-gray-50"
                      }
                      title={activity.description}
                      subtitle={`${new Date(activity.time).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })} - ${new Date(activity.time).toLocaleDateString("vi-VN")}`}
                      last={index === arr.length - 1}
                    />
                  ))}
                </SectionCard>
              )}
            </>
          )}

          {/* Báo cáo nhanh */}
          <View className="mt-4 p-5 bg-indigo-50 rounded-3xl flex-row items-center">
            <View className="w-12 h-12 rounded-2xl bg-white items-center justify-center">
              <Ionicons name="document-text" size={22} color="#6366F1" />
            </View>
            <View className="ml-4 flex-1">
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-800 text-base">
                Báo cáo nhanh
              </Text>
              <Text style={{ fontFamily: "Poppins-Regular" }} className="text-gray-500 text-xs">
                Kết quả học tập và điểm danh năm học {schoolYear}.
              </Text>
            </View>
            <TouchableOpacity
              className="bg-[#6366F1] px-4 py-2 rounded-full flex-row items-center"
              onPress={handleCreateReport}
              disabled={isGeneratingReport || !stats}
              style={{ opacity: !stats ? 0.5 : 1 }}
            >
              {isGeneratingReport ? <ActivityIndicator size="small" color="white" style={{ marginRight: 6 }} /> : null}
              <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-white text-[10px]">
                {isGeneratingReport ? "Đang tạo..." : "Tạo PDF"}
              </Text>
            </TouchableOpacity>
          </View>
        </FloatingBody>

        <ShortcutGrid title="Quản lý hệ thống" items={QUICK_ACTIONS} />
      </ScrollView>
      <SideMenu visible={isMenuVisible} onClose={() => setMenuVisible(false)} />
    </AdminPageWrapper>
  );
}
