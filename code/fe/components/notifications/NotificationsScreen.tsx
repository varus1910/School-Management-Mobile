import { useState, useCallback } from "react";
import { View, Text, SectionList, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { notificationService } from "../../services/notification.service";
import { NotificationResponse } from "../../types/notification";
import { EmptyState, PageHeader } from "../ui/PageHeader";

// helper function to group notifications
const groupNotifications = (notifications: NotificationResponse[]) => {
  const grouped: { [key: string]: NotificationResponse[] } = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  notifications.forEach((notif) => {
    const notifDate = new Date(notif.createdAt);
    let groupKey = "";

    if (notifDate.toDateString() === today.toDateString()) {
      groupKey = "Hôm nay";
    } else if (notifDate.toDateString() === yesterday.toDateString()) {
      groupKey = "Hôm qua";
    } else {
      groupKey = notifDate.toLocaleDateString("vi-VN");
    }

    if (!grouped[groupKey]) {
      grouped[groupKey] = [];
    }
    grouped[groupKey].push(notif);
  });

  return Object.keys(grouped).map((key) => ({
    title: key,
    data: grouped[key],
  }));
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** Biểu tượng và màu theo loại thông báo. */
const typeStyle = (type?: string) => {
  const t = (type ?? "").toLowerCase();
  if (t.includes("assignment") || t.includes("submission"))
    return { icon: "document-text", color: "#6366F1", bg: "bg-indigo-50" };
  if (t.includes("event")) return { icon: "calendar", color: "#D97706", bg: "bg-amber-50" };
  if (t.includes("pay") || t.includes("fee")) return { icon: "cash", color: "#F97316", bg: "bg-orange-50" };
  return { icon: "notifications", color: "#136ADA", bg: "bg-blue-50" };
};

/** Màn thông báo dùng chung cho Student, Parent và Teacher. */
export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, []),
  );

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getAllNotifications({
        pageNumber: 1,
        pageSize: 50,
      });
      const grouped = groupNotifications(res.items);
      setNotifications(grouped);
    } catch (error) {
      console.log("Error loading notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    Alert.alert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa thông báo này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await notificationService.deleteNotification(notificationId);
            fetchNotifications();
          } catch (error) {
            console.log("Error deleting notification", error);
            Alert.alert("Lỗi", "Không thể xóa thông báo.");
          }
        },
      },
    ]);
  };

  const total = notifications.reduce((sum, s) => sum + s.data.length, 0);
  const unread = notifications.reduce((sum, s) => sum + s.data.filter((n: any) => !n.isRead).length, 0);

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar hidden />

      <View className="bg-white border-b border-gray-100">
        <PageHeader
          title="Thông báo"
          subtitle={total === 0 ? undefined : unread > 0 ? `${unread} thông báo chưa đọc` : "Bạn đã đọc hết thông báo"}
        />
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon="notifications-off-outline"
          title="Chưa có thông báo nào"
          description="Thông báo về bài tập, sự kiện và học phí sẽ xuất hiện ở đây."
        />
      ) : (
        <SectionList
          onScrollBeginDrag={() => setOpenMenuId(null)}
          sections={notifications}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          renderSectionHeader={({ section: { title } }) => (
            <Text
              style={{ fontFamily: "Poppins-SemiBold" }}
              className="text-gray-500 text-xs uppercase tracking-widest mt-6 mb-3"
            >
              {title}
            </Text>
          )}
          renderItem={({ item }) => {
            const s = typeStyle(item.type);
            return (
              <View
                className={`flex-row items-center rounded-3xl p-4 mb-3 border ${
                  item.isRead ? "bg-white border-gray-100" : "bg-blue-50/60 border-blue-100"
                }`}
                style={{ zIndex: openMenuId === item.id ? 10 : 0 }}
              >
                <View className={`w-12 h-12 rounded-2xl items-center justify-center ${s.bg}`}>
                  <Ionicons name={s.icon as any} size={22} color={s.color} />
                </View>

                <View className="flex-1 mx-3">
                  <View className="flex-row items-center justify-between">
                    <Text
                      numberOfLines={1}
                      className="text-gray-900 text-sm flex-1 mr-2"
                      style={{ fontFamily: item.isRead ? "Poppins-SemiBold" : "Poppins-Bold" }}
                    >
                      {item.title}
                    </Text>
                    <Text className="text-gray-400 text-[10px]" style={{ fontFamily: "Poppins-Regular" }}>
                      {formatTime(item.createdAt)}
                    </Text>
                  </View>
                  <Text
                    className="text-gray-500 text-xs mt-0.5"
                    style={{ fontFamily: "Poppins-Regular" }}
                    numberOfLines={2}
                  >
                    {item.content}
                  </Text>
                </View>

                {!item.isRead && <View className="w-2 h-2 bg-[#136ADA] rounded-full mr-1" />}

                <View className="relative">
                  <TouchableOpacity
                    onPress={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                    className="p-2"
                  >
                    <Ionicons name="ellipsis-vertical" size={18} color="#9CA3AF" />
                  </TouchableOpacity>

                  {openMenuId === item.id && (
                    <View
                      className="absolute right-8 top-2 bg-white rounded-xl border border-gray-100 overflow-hidden"
                      style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 5,
                        minWidth: 80,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          setOpenMenuId(null);
                          handleDeleteNotification(item.id);
                        }}
                        className="flex-row items-center px-4 py-3"
                      >
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        <Text className="text-red-500 text-xs ml-2" style={{ fontFamily: "Poppins-Medium" }}>
                          Xóa
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
