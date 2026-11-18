export interface ChildInfo {
  studentId: string;
  userId: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  relationship?: string | null;
  className?: string | null;
  grade?: number | null;
  schoolYear?: number | null;
}

export interface ParentInfo {
  parentId: string;
  userId: string;
  fullName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
  birthday?: string | null;
  children: ChildInfo[];
}

export interface ParentListItem {
  parentId: string;
  userId: string;
  fullName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  childrenCount: number;
}

export interface GetParentsParams {
  pageNumber?: number;
  pageSize?: number;
  fullName?: string;
}

export interface LinkChildPayload {
  studentId: string;
  relationship?: string;
}
