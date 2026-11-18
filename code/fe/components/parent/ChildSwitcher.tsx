import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useParentStore } from "../../store/parentStore";

/**
 * Thanh chọn con đang xem, dùng ở đầu các màn hình dữ liệu của phụ huynh.
 * Chỉ hiển thị khi phụ huynh có ít nhất một con.
 */
export default function ChildSwitcher() {
  const { children, selectedChildId, selectChild } = useParentStore();

  if (children.length === 0) return null;

  return (
    <View className="px-6 py-3 bg-white border-b border-gray-50">
      <Text
        className="text-gray-400 text-[10px] mb-2 uppercase tracking-widest"
        style={{ fontFamily: "Poppins-SemiBold" }}
      >
        Đang xem thông tin của
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          {children.map((child) => {
            const isActive = child.studentId === selectedChildId;
            return (
              <TouchableOpacity
                key={child.studentId}
                onPress={() => selectChild(child.studentId)}
                className={`flex-row items-center px-4 py-2 rounded-2xl border ${
                  isActive ? "bg-blue-600 border-blue-600" : "bg-gray-50 border-gray-100"
                }`}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={18}
                  color={isActive ? "white" : "#6B7280"}
                />
                <View className="ml-2">
                  <Text
                    className={`text-xs ${isActive ? "text-white" : "text-gray-700"}`}
                    style={{ fontFamily: "Poppins-SemiBold" }}
                  >
                    {child.fullName ?? "Học sinh"}
                  </Text>
                  {child.className ? (
                    <Text
                      className={`text-[10px] ${isActive ? "text-white/80" : "text-gray-400"}`}
                      style={{ fontFamily: "Poppins-Regular" }}
                    >
                      Lớp {child.className}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
