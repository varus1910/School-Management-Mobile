import { useCallback, useEffect, useState } from "react";
import { parentService } from "../../services/parent.service";
import { useConfigStore } from "../../store/configStore";
import { ChildInfo } from "../../types/parent";
import { MyExamScheduleDetailResponse } from "../../types/examSchedule";
import { ScheduleDetailItem } from "../../types/schedule";

const FEE_PAID_STATUS = "Đã đóng";
const EXAM_TYPES = ["Giữa kì", "Cuối kì"];

export interface ChildOverview {
  loading: boolean;
  /** Các tiết học hôm nay, sắp theo giờ bắt đầu. null = không tải được. */
  todayLessons: ScheduleDetailItem[] | null;
  /** Tổng tiền học phí chưa đóng và số khoản chưa đóng. null = không tải được. */
  fees: { unpaidAmount: number; unpaidCount: number } | null;
  /** Điểm danh của tháng hiện tại. null = không tải được. */
  attendance: { percentage: number; present: number; absent: number } | null;
  /** Môn thi gần nhất từ hôm nay trở đi. */
  nextExam: MyExamScheduleDetailResponse | null;
  reload: () => void;
}

export function useChildOverview(child: ChildInfo | null): ChildOverview {
  const { schoolYear, term } = useConfigStore();
  const [loading, setLoading] = useState(false);
  const [todayLessons, setTodayLessons] = useState<ScheduleDetailItem[] | null>(null);
  const [fees, setFees] = useState<ChildOverview["fees"]>(null);
  const [attendance, setAttendance] = useState<ChildOverview["attendance"]>(null);
  const [nextExam, setNextExam] = useState<MyExamScheduleDetailResponse | null>(null);
  const [tick, setTick] = useState(0);

  const studentId = child?.studentId;

  useEffect(() => {
    if (!studentId) {
      setTodayLessons(null);
      setFees(null);
      setAttendance(null);
      setNextExam(null);
      return;
    }

    let cancelled = false;
    const now = new Date();
    const todayDow = now.getDay() === 0 ? 7 : now.getDay(); // 1=T2 ... 7=CN

    const run = async () => {
      setLoading(true);
      const [scheduleRes, feeRes, attendanceRes, ...examRes] = await Promise.allSettled([
        parentService.getChildSchedule(studentId, { Term: term, SchoolYear: schoolYear }),
        parentService.getChildFees(studentId, { schoolYear, pageSize: 50 }),
        parentService.getChildAttendance(studentId, {
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        }),
        ...EXAM_TYPES.map((type) =>
          parentService.getChildExamSchedule(studentId, { type, term, schoolYear }),
        ),
      ]);
      if (cancelled) return;

      setTodayLessons(
        scheduleRes.status === "fulfilled"
          ? scheduleRes.value
              .filter((s) => s.dayOfWeek === todayDow)
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
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

      setAttendance(
        attendanceRes.status === "fulfilled"
          ? {
              percentage: attendanceRes.value.percentage,
              present: attendanceRes.value.totalPresent,
              absent: attendanceRes.value.totalAbsent,
            }
          : null,
      );

      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const upcoming = examRes
        .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
        .filter((e) => new Date(e.date).getTime() >= today)
        .sort(
          (a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime() ||
            a.startTime.localeCompare(b.startTime),
        );
      setNextExam(upcoming[0] ?? null);

      setLoading(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [studentId, schoolYear, term, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { loading, todayLessons, fees, attendance, nextExam, reload };
}
