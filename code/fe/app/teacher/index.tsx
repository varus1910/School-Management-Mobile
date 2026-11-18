import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useCallback } from "react";
import { useAuthStore } from "../../store/authStore";
import { useConfigStore } from "../../store/configStore";
import SideMenu from "@/components/SideMenu";
import { classYearService } from "../../services/classYear.service";
import { attendanceService } from "../../services/attendance.service";
import { scheduleService } from "../../services/schedule.service";
import { TeacherScheduleDetailItem } from "../../types/schedule";
import { AdminPageWrapper } from "../../components/ui/AdminPageWrapper";
import {
  EmptyLine,
  FloatingBody,
  HeroChip,
  HomeHero,
  LessonTimeline,
  ListRow,
  PRIMARY,
  SectionCard,
  ShortcutGrid,
  ShortcutItem,
  StatTile,
  greeting,
  toMinutes,
} from "../../components/home/HomeParts";

const SHORTCUTS: ShortcutItem[] = [
  { icon: "calendar", label: "Lịch dạy", route: "/teacher/schedules", color: "#14B8A6", bg: "bg-teal-50" },
  { icon: "library", label: "Khóa học", route: "/teacher/courses", color: "#F97316", bg: "bg-orange-50" },
  { icon: "time", label: "Lịch thi", route: "/teacher/exam-schedules", color: "#F43F5E", bg: "bg-rose-50" },
  { icon: "megaphone", label: "Sự kiện", route: "/teacher/events", color: "#D97706", bg: "bg-amber-50" },
  { icon: "people", label: "Đồng nghiệp", route: "/teacher/community/teachers", color: "#6366F1", bg: "bg-indigo-50" },
  { icon: "sparkles", label: "AI Chat", route: "/teacher/ai-chat", color: "#8B5CF6", bg: "bg-violet-50" },
  { icon: "chatbubbles", label: "Tin nhắn", route: "/teacher/chat", color: "#06B6D4", bg: "bg-cyan-50" },
];

export default function TeacherDashboard() {
  const { userInfo } = useAuthStore();
  const { schoolYear, term } = useConfigStore();
  const teacherName = userInfo?.fullName?.split(" ").at(-1) ?? "Giáo viên";

  const [isMenuVisible, setMenuVisible] = useState(false);
  const [homeroomClass, setHomeroomClass] = useState<any>(null);
  const [teachingClasses, setTeachingClasses] = useState<any[]>([]);
  const [todayLessons, setTodayLessons] = useState<TeacherScheduleDetailItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceStats, setAttendanceStats] = useState<{
    present: number;
    absent: number;
    late: number;
    rate: number;
    total: number;
  } | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [hrRes, tcRes, schRes] = await Promise.all([
        classYearService.getHomeroomClass(schoolYear).catch(() => null),
        classYearService.getTeachingClasses({ schoolYear: schoolYear.toString() }).catch(() => []),
        scheduleService
          .getMyTeachingSchedule({ Term: term, SchoolYear: schoolYear })
          .catch(() => null),
      ]);

      // Map subjects from schedule to teaching classes
      const schedule = schRes ?? [];
      const mappedTeaching = tcRes.map((cls: any) => {
        const match = schedule.find((s: any) => s.className === cls.className);
        return {
          ...cls,
          subjectId: match?.subjectId || cls.subjectId || "",
          subjectName: match?.subjectName || cls.subjectName || "Chưa gán môn",
        };
      });

      // Filter out duplicate classYearId-subjectId pairs if any
      const uniqueTeaching = mappedTeaching.filter(
        (v: any, i: number, a: any[]) =>
          a.findIndex((t) => t.classYearId === v.classYearId && t.subjectId === v.subjectId) === i,
      );
      setHomeroomClass(hrRes);
      setTeachingClasses(uniqueTeaching);

      const now = new Date();
      const todayDow = now.getDay() === 0 ? 7 : now.getDay(); // 1=T2 ... 7=CN
      setTodayLessons(
        schRes === null
          ? null
          : schRes
              .filter((s) => s.dayOfWeek === todayDow)
              .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime)),
      );

      if (hrRes?.classYearId) {
        const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        try {
          const data = await attendanceService.getClassAttendance({
            classYearId: hrRes.classYearId,
            date: localToday,
          });
          const present = data.filter((i) => i.status === "present" || i.status === "Có mặt").length;
          const absent = data.filter((i) => i.status === "absent" || i.status === "Vắng mặt").length;
          const late = data.filter((i) => i.status === "late" || i.status === "Đi trễ").length;
          const total = data.length;
          setAttendanceStats({ present, absent, late, total, rate: total > 0 ? Math.round((present / total) * 100) : 0 });
        } catch (err) {
          console.log("Error fetching attendance stats:", err);
          setAttendanceStats(null);
        }
      } else {
        setAttendanceStats(null);
      }
    } catch (err) {
      console.log("Error fetching teacher dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [schoolYear, term]);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData]),
  );

  const lessonCount = todayLessons?.length ?? 0;
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const nextLesson = todayLessons?.find((l) => toMinutes(l.finishTime) > nowMin);

  return (
    <AdminPageWrapper
      showLogo={true}
      leftComponent={
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu-outline" size={28} color="black" />
        </TouchableOpacity>
      }
      rightComponent={
        <TouchableOpacity onPress={() => router.push("/teacher/notifications" as any)}>
          <Ionicons name="notifications-outline" size={28} color="black" />
        </TouchableOpacity>
      }
    >
      <StatusBar hidden />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDashboardData} />}
      >
        <HomeHero
          eyebrow={`${greeting()} 👋`}
          title={`Thầy/Cô ${teacherName}`}
          subtitle={
            todayLessons === null
              ? `Năm học ${schoolYear} - ${schoolYear + 1} • Học kỳ ${term}`
              : lessonCount === 0
                ? "Hôm nay bạn không có tiết dạy nào."
                : `Hôm nay bạn có ${lessonCount} tiết dạy.`
          }
          right={homeroomClass ? <HeroChip icon="star" label={`GVCN ${homeroomClass.className}`} /> : undefined}
        />

        <FloatingBody>
          <View className="flex-row gap-3">
            <StatTile
              icon="time"
              label="Tiết dạy hôm nay"
              onPress={() => router.push("/teacher/schedules" as any)}
              loading={loading && todayLessons === null}
              value={todayLessons === null ? "—" : String(lessonCount)}
              sub={
                todayLessons === null
                  ? "Chưa có dữ liệu"
                  : nextLesson
                    ? `Tiếp theo: ${nextLesson.startTime.slice(0, 5)} • ${nextLesson.className}`
                    : lessonCount === 0
                      ? "Không có tiết nào"
                      : "Đã dạy xong hôm nay"
              }
              tone={todayLessons === null ? "neutral" : "info"}
            />
            {homeroomClass ? (
              <StatTile
                icon="people"
                label={`Điểm danh lớp ${homeroomClass.className}`}
                onPress={() => router.push("/teacher/my-homeroom-class" as any)}
                loading={loading && !attendanceStats}
                value={attendanceStats && attendanceStats.total > 0 ? `${attendanceStats.rate}%` : "—"}
                sub={
                  attendanceStats && attendanceStats.total > 0
                    ? `${attendanceStats.present} có mặt • ${attendanceStats.absent} vắng • ${attendanceStats.late} trễ`
                    : "Hôm nay chưa điểm danh"
                }
                tone={
                  !attendanceStats || attendanceStats.total === 0
                    ? "neutral"
                    : attendanceStats.rate >= 90
                      ? "good"
                      : "warn"
                }
              />
            ) : (
              <StatTile
                icon="school"
                label="Lớp giảng dạy"
                onPress={() => router.push("/teacher/my-class" as any)}
                loading={loading}
                value={String(teachingClasses.length)}
                sub={`Năm học ${schoolYear}`}
                tone="info"
              />
            )}
          </View>

          {/* Lịch dạy hôm nay */}
          <SectionCard title="Lịch dạy hôm nay" actionLabel="Cả tuần" onAction={() => router.push("/teacher/schedules" as any)}>
            {loading && todayLessons === null ? (
              <ActivityIndicator color={PRIMARY} />
            ) : todayLessons === null ? (
              <EmptyLine text="Không tải được lịch dạy." />
            ) : todayLessons.length === 0 ? (
              <EmptyLine text="Hôm nay bạn không có tiết dạy nào." />
            ) : (
              <LessonTimeline
                lessons={todayLessons.map((l) => ({
                  id: l.scheduleDetailId,
                  subjectName: l.subjectName,
                  startTime: l.startTime,
                  finishTime: l.finishTime,
                  timeRange: l.timeRange,
                  extra: [`Lớp ${l.className}`, l.roomName].filter(Boolean).join(" • "),
                }))}
              />
            )}
          </SectionCard>

          {/* Lớp chủ nhiệm */}
          {homeroomClass && (
            <TouchableOpacity
              onPress={() => router.push("/teacher/my-homeroom-class")}
              className="mt-4 bg-blue-50 rounded-3xl p-5 flex-row items-center"
            >
              <View className="w-12 h-12 rounded-2xl bg-white items-center justify-center">
                <Ionicons name="star" size={22} color={PRIMARY} />
              </View>
              <View className="ml-4 flex-1">
                <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-[#136ADA] text-[10px] uppercase tracking-widest">
                  Lớp chủ nhiệm • Năm học {schoolYear}
                </Text>
                <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-800 text-base">
                  Lớp {homeroomClass.className}
                </Text>
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-xs">
                  Bạn đang là giáo viên chủ nhiệm
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={PRIMARY} />
            </TouchableOpacity>
          )}

          {/* Lớp giảng dạy */}
          <SectionCard title="Lớp giảng dạy" actionLabel="Tất cả" onAction={() => router.push("/teacher/my-class")}>
            {loading && teachingClasses.length === 0 ? (
              <ActivityIndicator color={PRIMARY} />
            ) : teachingClasses.length === 0 ? (
              <EmptyLine text="Chưa có lớp giảng dạy." />
            ) : (
              teachingClasses.slice(0, 4).map((item, i, arr) => (
                <ListRow
                  key={`${item.classYearId}-${item.subjectId || i}`}
                  icon="school-outline"
                  iconColor={PRIMARY}
                  iconBg="bg-blue-50"
                  title={`Lớp ${item.className}`}
                  subtitle={`${item.subjectName} • Khối ${item.grade}${item.studentCount ? ` • ${item.studentCount} học sinh` : ""}`}
                  last={i === arr.length - 1}
                  onPress={() =>
                    router.push({
                      pathname: `/teacher/my-class/${item.classYearId}`,
                      params: { subjectId: item.subjectId, subjectName: item.subjectName },
                    } as any)
                  }
                />
              ))
            )}
          </SectionCard>
        </FloatingBody>

        <ShortcutGrid title="Tiện ích nghiệp vụ" items={SHORTCUTS} />
      </ScrollView>
      <SideMenu visible={isMenuVisible} onClose={() => setMenuVisible(false)} />
    </AdminPageWrapper>
  );
}
