import {
  Stack,
  router,
  useRootNavigationState,
} from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { useParentStore } from "../../store/parentStore";
import { useEffect } from "react";

import { RoleTabsFrame } from "../../components/RoleTabBar";
export default function ParentLayout() {
  const userInfo = useAuthStore((state) => (state as any).userInfo);
  const isLoading = useAuthStore((state) => (state as any).isLoading);
  const loadChildren = useParentStore((state) => state.loadChildren);
  const navigationState = useRootNavigationState();

  const isParent = userInfo?.role?.toLowerCase() === "parent";

  useEffect(() => {
    if (!navigationState?.key) return;
    if (!isLoading && !userInfo) {
      router.replace("/login");
    }
  }, [userInfo, isLoading, navigationState?.key]);

  // Tải danh sách con ngay khi phụ huynh vào khu vực của mình
  useEffect(() => {
    if (isParent) loadChildren();
  }, [isParent]);

  // Navigation chưa ready hoặc đang load
  if (!navigationState?.key || isLoading || !userInfo) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <ActivityIndicator size="large" color="#136ADA" />
      </View>
    );
  }

  if (!isParent) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <ActivityIndicator size="large" color="#FF3B30" />
      </View>
    );
  }

  return (
    <RoleTabsFrame role="parent">
      <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ animation: "none", title: "Trang chủ Phụ huynh" }} />
      <Stack.Screen name="profile" options={{ animation: "none", title: "Hồ sơ cá nhân" }} />
      <Stack.Screen name="fees" options={{ animation: "none", title: "Học phí của con" }} />
      <Stack.Screen name="results" options={{ animation: "none", title: "Kết quả học tập" }} />
      <Stack.Screen name="attendance" options={{ title: "Lịch sử điểm danh" }} />
      <Stack.Screen name="timetable" options={{ title: "Thời khóa biểu" }} />
      <Stack.Screen name="exam-schedule" options={{ title: "Lịch thi" }} />
      <Stack.Screen name="notifications" options={{ title: "Thông báo" }} />
      <Stack.Screen name="ai-chat" options={{ title: "Trợ lý AI" }} />
      <Stack.Screen name="chat/[id]" options={{ title: "Tin nhắn" }} />
      <Stack.Screen name="chat/new" options={{ title: "Tin nhắn mới" }} />
      <Stack.Screen name="chat/new-group" options={{ title: "Tạo nhóm" }} />
      <Stack.Screen name="chat/add-members" options={{ title: "Thêm thành viên" }} />
      <Stack.Screen name="chat/edit-group" options={{ title: "Sửa nhóm" }} />
      <Stack.Screen name="chat/index" options={{ animation: "none", title: "Tin nhắn" }} />
    </Stack>
    </RoleTabsFrame>
  );
}
