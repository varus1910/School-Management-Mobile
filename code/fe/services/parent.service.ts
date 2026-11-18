import { StudentAttendanceResponse, GetStudentAttendanceParams } from "../types/attendance";
import { ApiResponse, PagedResponse } from "../types/common";
import { MyExamScheduleDetailRequest, MyExamScheduleDetailResponse } from "../types/examSchedule";
import { FeeDetailResponse, MyFeeDetailFilterRequest } from "../types/fee";
import {
  ChildInfo,
  GetParentsParams,
  LinkChildPayload,
  ParentInfo,
  ParentListItem,
} from "../types/parent";
import { GetStudentResultsParams, StudentResultReport } from "../types/result";
import { GetMyClassScheduleParams, ScheduleDetailItem } from "../types/schedule";
import apiClient from "./apiClient";

export const parentService = {
  // ─── ADMIN ────────────────────────────────────────────────────────────────────
  /**
   * Admin lấy danh sách phụ huynh
   * GET /parents
   * AuthN(login) + AuthZ(Admin)
   */
  getParents: async (params?: GetParentsParams): Promise<PagedResponse<ParentListItem>> => {
    const response = await apiClient.get<PagedResponse<ParentListItem>>("/parents", { params });
    return response.data;
  },

  /**
   * Admin xem chi tiết phụ huynh kèm danh sách con
   * GET /parents/{parentId}
   * AuthN(login) + AuthZ(Admin)
   */
  getParentById: async (parentId: string): Promise<ParentInfo> => {
    const response = await apiClient.get<ParentInfo>(`/parents/${parentId}`);
    return response.data;
  },

  /**
   * Admin gắn con cho phụ huynh
   * POST /parents/{parentId}/children
   * AuthN(login) + AuthZ(Admin)
   * 404: Phụ huynh hoặc học sinh không tồn tại
   * 409: Đã gắn rồi
   */
  linkChild: async (parentId: string, payload: LinkChildPayload): Promise<ChildInfo> => {
    const response = await apiClient.post<ChildInfo>(`/parents/${parentId}/children`, payload);
    return response.data;
  },

  /**
   * Admin gỡ con khỏi phụ huynh
   * DELETE /parents/{parentId}/children/{studentId}
   * AuthN(login) + AuthZ(Admin)
   */
  unlinkChild: async (parentId: string, studentId: string): Promise<void> => {
    await apiClient.delete(`/parents/${parentId}/children/${studentId}`);
  },

  // ─── PARENT: PROFILE ──────────────────────────────────────────────────────────
  /**
   * Phụ huynh xem hồ sơ của mình
   * GET /parents/me
   * AuthN(login) + AuthZ(Parent)
   */
  getMe: async (): Promise<ParentInfo> => {
    const response = await apiClient.get<ParentInfo>("/parents/me");
    return response.data;
  },

  /**
   * Phụ huynh cập nhật hồ sơ (kèm ảnh đại diện)
   * PATCH /parents/me
   * AuthN(login) + AuthZ(Parent)
   */
  updateMe: async (payload: FormData): Promise<ParentInfo> => {
    const response = await apiClient.patch<ParentInfo>("/parents/me", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * Phụ huynh lấy danh sách con
   * GET /parents/me/children
   * AuthN(login) + AuthZ(Parent)
   */
  getMyChildren: async (): Promise<ChildInfo[]> => {
    const response = await apiClient.get<ChildInfo[]>("/parents/me/children");
    return response.data;
  },

  // ─── PARENT: DỮ LIỆU CỦA CON ──────────────────────────────────────────────────
  /**
   * GET /parents/children/{studentId}/fees
   * AuthN(login) + AuthZ(Parent) - 403 nếu không phải con của mình
   */
  getChildFees: async (
    studentId: string,
    params: MyFeeDetailFilterRequest,
  ): Promise<PagedResponse<FeeDetailResponse>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<FeeDetailResponse>>>(
      `/parents/children/${studentId}/fees`,
      { params },
    );
    return response.data.data;
  },

  /**
   * GET /parents/children/{studentId}/results?Term=&SchoolYear=
   */
  getChildResults: async (
    studentId: string,
    params: GetStudentResultsParams,
  ): Promise<StudentResultReport> => {
    const response = await apiClient.get<ApiResponse<StudentResultReport>>(
      `/parents/children/${studentId}/results`,
      { params },
    );
    return response.data.data;
  },

  /**
   * GET /parents/children/{studentId}/attendance?Month=&Year=
   */
  getChildAttendance: async (
    studentId: string,
    params: GetStudentAttendanceParams,
  ): Promise<StudentAttendanceResponse> => {
    const response = await apiClient.get<StudentAttendanceResponse>(
      `/parents/children/${studentId}/attendance`,
      { params },
    );
    return response.data;
  },

  /**
   * GET /parents/children/{studentId}/schedule?Term=&SchoolYear=
   */
  getChildSchedule: async (
    studentId: string,
    params: GetMyClassScheduleParams,
  ): Promise<ScheduleDetailItem[]> => {
    const response = await apiClient.get<ScheduleDetailItem[]>(
      `/parents/children/${studentId}/schedule`,
      { params },
    );
    return response.data;
  },

  /**
   * GET /parents/children/{studentId}/exam-schedules?Type=&Term=&SchoolYear=
   */
  getChildExamSchedule: async (
    studentId: string,
    params: MyExamScheduleDetailRequest,
  ): Promise<MyExamScheduleDetailResponse[]> => {
    const response = await apiClient.get<ApiResponse<MyExamScheduleDetailResponse[]>>(
      `/parents/children/${studentId}/exam-schedules`,
      { params },
    );
    return response.data.data;
  },
};
