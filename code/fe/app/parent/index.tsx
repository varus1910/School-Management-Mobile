import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, memo } from "react";
import { useAuthStore } from "../../store/authStore";
import { useConfigStore } from "../../store/configStore";
import { useParentStore } from "../../store/parentStore";
import { ChildInfo } from "../../types/parent";
import SideMenu from "@/components/SideMenu";
import { AdminPageWrapper } from "../../components/ui/AdminPageWrapper";

const ChildCard = memo(
  ({
    item,
    isSelected,
    onPress,
  }: {
    item: ChildInfo;
    isSelected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`w-64 p-6 rounded-[32px] shadow-lg ${
        isSelected ? "bg-[#136ADA] shadow-blue-100" : "bg-gray-100 shadow-gray-100"
      }`}
    >
      <View className="flex-row justify-between items-start mb-6">
        <View className="flex-row items-center gap-3 flex-1">
          <View className={`${isSelected ? "bg-white/20" : "bg-white"} p-2 rounded-xl`}>
            <Ionicons
              name="school-outline"
              size={22}
              color={isSelected ? "white" : "#136ADA"}
            />
          </View>
          <View className="flex-1">
            <Text
              numberOfLines={1}
              className={`${isSelected ? "text-white" : "text-gray-800"} text-lg`}
              style={{ fontFamily: "Poppins-Bold" }}
            >
              {item.fullName ?? "Học sinh"}
            </Text>
            <Text
              className={`${isSelected ? "text-white/80" : "text-gray-400"} text-[10px]`}
              style={{ fontFamily: "Poppins-Medium" }}
            >
              {item.className ? `Lớp ${item.className}` : "Chưa có lớp"}
              {item.grade ? ` • Khối ${item.grade}` : ""}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row items-center justify-between mt-2">
        <View className="flex-row items-center gap-1">
          <Ionicons
            name="heart-outline"
            size={14}
            color={isSelected ? "white" : "#6B7280"}
          />
          <Text
            className={`${isSelected ? "text-white" : "text-gray-600"} text-xs`}
            style={{ fontFamily: "Poppins-Bold" }}
          >
            {item.relationship || "Con"}
          </Text>
        </View>
        <View className={`${isSelected ? "bg-white/20" : "bg-white"} px-3 py-1.5 rounded-xl`}>
          <Ionicons
            name={isSelected ? "checkmark" : "arrow-forward"}
            size={16}
            color={isSelected ? "white" : "#136ADA"}
          />
        </View>
      </View>
    </TouchableOpacity>
  ),
);

export default function ParentDashboard() {
  const { userInfo } = useAuthStore();
  const { schoolYear } = useConfigStore();
  const { children, selectedChildId, selectChild, isLoading, loadChildren } =
    useParentStore();
  const parentName = userInfo?.fullName?.split(" ").at(-1) ?? "Phụ huynh";

  const [isMenuVisible, setMenuVisible] = useState(false);

  const selectedChild = children.find((c) => c.studentId === selectedChildId);

  return (
    <AdminPageWrapper
      showLogo={true}
      leftComponent={
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu-outline" size={28} color="black" />
        </TouchableOpacity>
      }
      rightComponent={
        <TouchableOpacity
          onPress={() => router.push("/parent/notifications" as any)}
        >
          <Ionicons name="notifications-outline" size={28} color="black" />
        </TouchableOpacity>
      }
    >
      <StatusBar hidden />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadChildren} />
        }
      >
        {/* Welcome Greeting */}
        <View className="px-6 mt-6 mb-2">
          <Text
            style={{ fontFamily: "Poppins-SemiBold" }}
            className="text-black text-xl"
          >
            Xin chào, {parentName} 👋
          </Text>
          <Text
            style={{ fontFamily: "Poppins-Regular" }}
            className="text-gray-400 text-xs"
          >
            Theo dõi tình hình học tập của con trong năm học {schoolYear} -{" "}
            {schoolYear + 1}.
          </Text>
        </View>

        {/* Children Horizontal Section */}
        <View className="mb-8 mt-4">
          <View className="flex-row justify-between items-center px-6 mb-4">
            <Text
              style={{ fontFamily: "Poppins-SemiBold" }}
              className="text-gray-500 text-xs mb-0 uppercase tracking-widest"
            >
              Con của bạn
            </Text>
          </View>

          {isLoading && children.length === 0 ? (
            <View className="py-10">
              <ActivityIndicator size="large" color="#136ADA" />
            </View>
          ) : (
            <FlatList
              data={children}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
              renderItem={({ item }) => (
                <ChildCard
                  item={item}
                  isSelected={item.studentId === selectedChildId}
                  onPress={() => selectChild(item.studentId)}
                />
              )}
              keyExtractor={(item) => item.studentId}
              ListEmptyComponent={() => (
                <View className="w-80 bg-gray-50 border border-gray-100 p-5 rounded-[32px] items-center justify-center">
                  <Ionicons name="school-outline" size={32} color="#CCC" />
                  <Text
                    className="text-gray-400 mt-2 text-xs text-center"
                    style={{ fontFamily: "Poppins-Medium" }}
                  >
                    Tài khoản chưa được gắn với học sinh nào.{"\n"}Vui lòng liên
                    hệ nhà trường.
                  </Text>
                </View>
              )}
            />
          )}
        </View>

        {/* Services Grid */}
        <View className="px-6 mb-8 mt-2">
          <Text
            style={{ fontFamily: "Poppins-SemiBold" }}
            className="text-gray-500 text-xs mb-3 uppercase tracking-widest"
          >
            Tiện ích theo dõi{selectedChild?.fullName ? ` • ${selectedChild.fullName}` : ""}
          </Text>
          <View className="flex-row flex-wrap justify-between gap-y-4">
            <ParentCard
              icon="card"
              label="Học phí"
              route="/parent/fees"
              color="bg-teal-100"
              iconColor="#14B8A6"
            />
            <ParentCard
              icon="stats-chart"
              label="Kết quả"
              route="/parent/results"
              color="bg-orange-100"
              iconColor="#F97316"
            />
            <ParentCard
              icon="calendar"
              label="Điểm danh"
              route="/parent/attendance"
              color="bg-rose-100"
              iconColor="#F43F5E"
            />
            <ParentCard
              icon="time"
              label="Lịch học"
              route="/parent/timetable"
              color="bg-amber-100"
              iconColor="#D97706"
            />
            <ParentCard
              icon="document-text"
              label="Lịch thi"
              route="/parent/exam-schedule"
              color="bg-indigo-100"
              iconColor="#6366F1"
            />
            <ParentCard
              icon="sparkles"
              label="AI Chat"
              route="/parent/ai-chat"
              color="bg-violet-100"
              iconColor="#8B5CF6"
            />
            <ParentCard
              icon="chatbubbles"
              label="Tin nhắn"
              route="/parent/chat"
              color="bg-cyan-100"
              iconColor="#06B6D4"
            />
          </View>
        </View>

        {/* Bottom Banner */}
        <View className="px-6 pb-12 mt-2">
          <View className="bg-white border border-gray-100 rounded-[40px] p-6 shadow-sm overflow-hidden min-h-[160px] relative">
            <View
              className="absolute right-[-10] top-5 w-32 h-32 bg-teal-500/5 rounded-full"
              style={{ transform: [{ scale: 1.5 }] }}
            />

            <View className="z-10 flex-1 justify-between">
              <View>
                <Text
                  className="text-[#14B8A6] text-sm mb-1"
                  style={{ fontFamily: "Poppins-Bold" }}
                >
                  Thông báo mới
                </Text>
                <Text
                  className="text-gray-800 leading-snug"
                  style={{ fontFamily: "Poppins-SemiBold", fontSize: 18 }}
                  numberOfLines={2}
                >
                  Xem các thông báo về học phí và hoạt động của con.
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => router.push("/parent/notifications" as any)}
                className="bg-teal-50 self-start px-5 py-2 rounded-xl mt-4"
              >
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-[#14B8A6] text-[10px] uppercase tracking-widest"
                >
                  Kiểm tra ngay
                </Text>
              </TouchableOpacity>
            </View>

            <View className="absolute right-4 bottom-4 opacity-10">
              <Ionicons name="notifications" size={60} color="#14B8A6" />
            </View>
          </View>
        </View>
      </ScrollView>
      <SideMenu visible={isMenuVisible} onClose={() => setMenuVisible(false)} />
    </AdminPageWrapper>
  );
}

// --- Helper Components ---

function ParentCard({
  icon,
  label,
  route,
  color,
  iconColor,
}: {
  icon: string;
  label: string;
  route: string;
  color: string;
  iconColor: string;
}) {
  return (
    <TouchableOpacity
      onPress={() => router.push(route as any)}
      className={`${color} w-[31%] py-6 rounded-2xl items-center justify-center gap-2`}
    >
      <View className="w-10 h-10 bg-white/50 rounded-full items-center justify-center">
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <Text
        style={{ fontFamily: "Poppins-Medium" }}
        className="text-black text-xs text-center"
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
