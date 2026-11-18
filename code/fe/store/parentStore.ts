import { create } from "zustand";
import { parentService } from "../services/parent.service";
import { ChildInfo } from "../types/parent";

interface ParentState {
  children: ChildInfo[];
  selectedChildId: string | null;
  isLoading: boolean;
  loadChildren: () => Promise<void>;
  selectChild: (studentId: string) => void;
  clear: () => void;
}

export const useParentStore = create<ParentState>((set, get) => ({
  children: [],
  selectedChildId: null,
  isLoading: false,

  loadChildren: async () => {
    set({ isLoading: true });
    try {
      const children = await parentService.getMyChildren();
      const { selectedChildId } = get();
      const stillExists = children.some((c) => c.studentId === selectedChildId);
      set({
        children,
        selectedChildId: stillExists ? selectedChildId : (children[0]?.studentId ?? null),
        isLoading: false,
      });
    } catch (error) {
      console.log("Error loading children:", error);
      set({ isLoading: false });
    }
  },

  selectChild: (studentId: string) => set({ selectedChildId: studentId }),

  clear: () => set({ children: [], selectedChildId: null, isLoading: false }),
}));

// Lấy thông tin con đang được chọn
export const useSelectedChild = (): ChildInfo | null =>
  useParentStore((state) => state.children.find((c) => c.studentId === state.selectedChildId) ?? null);
