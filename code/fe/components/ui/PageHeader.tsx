import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

/**
 * Header dùng chung cho các màn chi tiết: nút quay lại tròn, tiêu đề và mô tả ngắn.
 * Đặt bên trong SafeAreaView (hoặc AdminPageWrapper) để không bị thanh trạng thái che.
 */
export function PageHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <View className="flex-row items-center px-6 py-4 bg-white">
      <TouchableOpacity
        onPress={onBack ?? (() => router.back())}
        className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 items-center justify-center"
      >
        <Ionicons name="arrow-back" size={20} color="#111827" />
      </TouchableOpacity>
      <View className="flex-1 mx-4">
        <Text numberOfLines={1} style={{ fontFamily: "Poppins-Bold" }} className="text-gray-900 text-lg">
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={{ fontFamily: "Poppins-Regular" }} className="text-gray-400 text-xs">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? <View className="w-10" />}
    </View>
  );
}

/** Trạng thái rỗng thống nhất: biểu tượng trong ô tròn + tiêu đề + mô tả. */
export function EmptyState({ icon, title, description }: { icon: string; title: string; description?: string }) {
  return (
    <View className="flex-1 items-center justify-center px-10">
      <View className="w-20 h-20 rounded-full bg-blue-50 items-center justify-center">
        <Ionicons name={icon as any} size={36} color="#136ADA" />
      </View>
      <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-800 text-base mt-5 text-center">
        {title}
      </Text>
      {description ? (
        <Text style={{ fontFamily: "Poppins-Regular" }} className="text-gray-400 text-xs mt-1 text-center">
          {description}
        </Text>
      ) : null}
    </View>
  );
}
