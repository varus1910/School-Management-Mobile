import { router } from "expo-router";
import { useAuthStore } from "../store/authStore";

const HOME_BY_ROLE: Record<string, string> = {
  admin: "/admin",
  teacher: "/teacher",
  parent: "/parent",
  student: "/(tabs)/home",
};

/**
 * Quay lại màn trước. Các màn trên thanh tab được mở bằng `replace` nên có thể không còn
 * màn nào phía sau; khi đó chuyển về trang chủ của role thay vì báo lỗi GO_BACK.
 */
export function goBack() {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  const role = useAuthStore.getState().userInfo?.role?.toLowerCase() ?? "";
  router.replace((HOME_BY_ROLE[role] ?? "/login") as any);
}
