import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { ReactNode } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/theme";

export interface RoleTab {
  label: string;
  icon: string;
  route: string;
}

/** 5 tab của từng role: Trang chủ, 2 tab nghiệp vụ, Tin nhắn, Cá nhân (giống thanh tab của Student). */
export const ROLE_TABS: Record<"admin" | "teacher" | "parent", RoleTab[]> = {
  admin: [
    { label: "Trang chủ", icon: "home-outline", route: "/admin" },
    { label: "Người dùng", icon: "people-outline", route: "/admin/users" },
    { label: "Học phí", icon: "cash-outline", route: "/admin/fees" },
    { label: "Tin nhắn", icon: "chatbubbles-outline", route: "/admin/chat" },
    { label: "Cá nhân", icon: "person-outline", route: "/admin/profile" },
  ],
  teacher: [
    { label: "Trang chủ", icon: "home-outline", route: "/teacher" },
    { label: "Lịch dạy", icon: "calendar-outline", route: "/teacher/schedules" },
    { label: "Lớp học", icon: "school-outline", route: "/teacher/my-class" },
    { label: "Tin nhắn", icon: "chatbubbles-outline", route: "/teacher/chat" },
    { label: "Cá nhân", icon: "person-outline", route: "/teacher/edit-profile" },
  ],
  parent: [
    { label: "Trang chủ", icon: "home-outline", route: "/parent" },
    { label: "Kết quả", icon: "stats-chart-outline", route: "/parent/results" },
    { label: "Học phí", icon: "card-outline", route: "/parent/fees" },
    { label: "Tin nhắn", icon: "chatbubbles-outline", route: "/parent/chat" },
    { label: "Cá nhân", icon: "person-outline", route: "/parent/profile" },
  ],
};

const normalize = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);

/**
 * Bọc khu vực của một role: hiển thị thanh tab dưới, nhưng chỉ ở 5 màn hình chính.
 * Các màn chi tiết (đẩy thêm vào stack) không có thanh này, giống Student.
 */
export function RoleTabsFrame({ role, children }: { role: keyof typeof ROLE_TABS; children: ReactNode }) {
  const pathname = normalize(usePathname());
  const insets = useSafeAreaInsets();
  const tabs = ROLE_TABS[role];
  const active = tabs.find((t) => t.route === pathname);

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1 }}>{children}</View>

      {active && (
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "white",
            borderTopWidth: 0.5,
            borderTopColor: "#E5E7EB",
            paddingTop: 8,
            paddingBottom: Math.max(insets.bottom, 8),
          }}
        >
          {tabs.map((tab) => {
            const focused = tab.route === active.route;
            const color = focused ? Colors.light.tint : Colors.light.tabIconDefault;
            return (
              <Pressable
                key={tab.route}
                accessibilityRole="button"
                accessibilityState={{ selected: focused }}
                onPress={() => {
                  if (focused) return;
                  if (Platform.OS === "ios") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.replace(tab.route as any);
                }}
                style={{ flex: 1, alignItems: "center" }}
              >
                <Ionicons name={tab.icon as any} size={24} color={color} />
                <Text style={{ color, fontSize: 10, marginTop: 2, fontFamily: "Poppins-Medium" }} numberOfLines={1}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
