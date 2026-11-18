import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { assignmentService } from "../../services/assignment.service";
import { attendanceService } from "../../services/attendance.service";
import { classYearService } from "../../services/classYear.service";
import { eventService } from "../../services/event.service";
import { examScheduleService } from "../../services/examSchedule.service";
import { feeDetailService } from "../../services/fee.service";
import { scheduleService } from "../../services/schedule.service";
import { useConfigStore } from "../../store/configStore";
import { MyExamScheduleDetailResponse } from "../../types/examSchedule";
import { ScheduleDetailItem } from "../../types/schedule";

const FEE_PAID_STATUS = "Đã đóng";
const EXAM_TYPES = ["Giữa kì", "Cuối kì"];

export interface StudentOverview {
  loading: boolean;
  className: string | null;
  todayLessons: ScheduleDetailItem[] | null;
  /** Bài tập chưa nộp/chưa chấm, sắp theo hạn nộp. null = không tải được. */
  pendingAssignments: any[] | null;
  attendance: { percentage: number; present: number; absent: number } | null;
  fees: { unpaidAmount: number; unpaidCount: number } | null;
  nextExam: MyExamScheduleDetailResponse | null;
  nextEvent: any | null;
  reload: () => void;
}

export function useStudentOverview(): StudentOverview {
  const { schoolYear, term } = useConfigStore();
  const [loading, setLoading] = useState(false);
  const [className, setClassName] = useState<string | null>(null);
  const [todayLessons, setTodayLessons] = useState<ScheduleDetailItem[] | null>(null);
  const [pendingAssignments, setPendingAssignments] = useState<any[] | null>(null);
  const [attendance, setAttendance] = useState<StudentOverview["attendance"]>(null);
  const [fees, setFees] = useState<StudentOverview["fees"]>(null);
  const [nextExam, setNextExam] = useState<MyExamScheduleDetailResponse | null>(null);
  const [nextEvent, setNextEvent] = useState<any | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const now = new Date();
    const todayDow = now.getDay() === 0 ? 7 : now.getDay(); // 1=T2 ... 7=CN
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    // Lớp của học sinh: dùng để lọc bài tập như màn hình cũ.
    const myClass = await classYearService.getMyClass(schoolYear).catch(() => null);
    setClassName(myClass?.className ?? null);

    const [scheduleRes, assignmentRes, attendanceRes, feeRes, eventRes, ...examRes] = await Promise.allSettled([
      scheduleService.getMyClassSchedule({ Term: term, SchoolYear: schoolYear }),
      assignmentService.getMyAssignments(myClass?.classYearId ? { ClassYearId: myClass.classYearId } : {}),
      attendanceService.getMyAttendance({ month: now.getMonth() + 1, year: now.getFullYear() }),
      feeDetailService.getMyFees({ schoolYear, pageSize: 50 }),
      eventService.getEvents({ SchoolYear: schoolYear, Term: term }),
      ...EXAM_TYPES.map((type) => examScheduleService.getMyExamSchedule({ type, term, schoolYear })),
    ]);

    setTodayLessons(
      scheduleRes.status === "fulfilled"
        ? scheduleRes.value
            .filter((s) => s.dayOfWeek === todayDow)
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
        : null,
    );

    setPendingAssignments(
      assignmentRes.status === "fulfilled"
        ? (Array.isArray(assignmentRes.value) ? assignmentRes.value : [])
            .filter((a) => a.status !== "Submitted" && a.status !== "Graded")
            .sort((a, b) => new Date(a.finishTime).getTime() - new Date(b.finishTime).getTime())
        : null,
    );

    setAttendance(
      attendanceRes.status === "fulfilled"
        ? {
            percentage: attendanceRes.value.percentage,
            present: attendanceRes.value.totalPresent,
            absent: attendanceRes.value.totalAbsent,
          }
        : null,
    );

    if (feeRes.status === "fulfilled") {
      const unpaid = feeRes.value.items.filter((f) => f.status !== FEE_PAID_STATUS);
      setFees({
        unpaidAmount: unpaid.reduce((sum, f) => sum + f.amountDue, 0),
        unpaidCount: unpaid.length,
      });
    } else {
      setFees(null);
    }

    const upcomingExams = examRes
      .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
      .filter((e) => new Date(e.date).getTime() >= today)
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime() || a.startTime.localeCompare(b.startTime),
      );
    setNextExam(upcomingExams[0] ?? null);

    if (eventRes.status === "fulfilled") {
      const events: any[] = eventRes.value.items || [];
      const upcoming = events
        .filter((e) => new Date(e.eventDate).getTime() >= today)
        .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
      setNextEvent(upcoming[0] ?? events[0] ?? null);
    } else {
      setNextEvent(null);
    }

    setLoading(false);
  }, [schoolYear, term]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return {
    loading,
    className,
    todayLessons,
    pendingAssignments,
    attendance,
    fees,
    nextExam,
    nextEvent,
    reload: load,
  };
}
