import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Text, View } from "react-native";

/** Khối xanh đầu trang hồ sơ: ảnh đại diện có viền, họ tên và nhãn vai trò. */
export function ProfileHero({
  name,
  avatarUrl,
  roleLabel,
  fallbackInitial,
}: {
  name: string;
  avatarUrl?: string | null;
  roleLabel: string;
  fallbackInitial: string;
}) {
  return (
    <View className="items-center pt-6 pb-8 px-6 rounded-b-[36px]" style={{ backgroundColor: "#136ADA" }}>
      <View
        className="items-center justify-center overflow-hidden"
        style={{
          width: 104,
          height: 104,
          borderRadius: 52,
          borderWidth: 4,
          borderColor: "rgba(255,255,255,0.65)",
          backgroundColor: "rgba(255,255,255,0.2)",
        }}
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: 96, height: 96, borderRadius: 48 }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <Text style={{ fontFamily: "Poppins-Bold", fontSize: 38, color: "white" }}>{fallbackInitial}</Text>
        )}
      </View>
      <Text
        numberOfLines={2}
        className="text-white text-xl mt-4 text-center"
        style={{ fontFamily: "Poppins-Bold" }}
      >
        {name}
      </Text>
      <View className="bg-white/20 px-4 py-1 rounded-full mt-2">
        <Text className="text-white text-[10px] uppercase tracking-widest" style={{ fontFamily: "Poppins-SemiBold" }}>
          {roleLabel}
        </Text>
      </View>
    </View>
  );
}

/** Một dòng thông tin trong hồ sơ: ô biểu tượng, nhãn nhỏ và giá trị. */
export function InfoField({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View className="flex-row items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm shadow-gray-100">
      <View className="w-11 h-11 rounded-2xl bg-blue-50 items-center justify-center mr-4">
        <Ionicons name={icon as any} size={20} color="#136ADA" />
      </View>
      <View className="flex-1">
        <Text style={{ fontFamily: "Poppins-Regular" }} className="text-gray-400 text-[10px] uppercase tracking-wider">
          {label}
        </Text>
        <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-900 text-sm">
          {value}
        </Text>
      </View>
    </View>
  );
}
