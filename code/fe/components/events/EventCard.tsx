import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { EventItem } from "../../types/event";

export function getEventStatus(item: EventItem) {
  const now = new Date();
  const s = new Date(`${item.eventDate}T${item.startTime}`);
  const f = new Date(`${item.eventDate}T${item.finishTime}`);
  if (now < s) return { label: "Sắp tới", color: "text-blue-500", bg: "bg-blue-50" };
  if (now > f) return { label: "Đã kết thúc", color: "text-gray-400", bg: "bg-gray-100" };
  return { label: "Đang diễn ra", color: "text-green-500", bg: "bg-green-50" };
}

/** Thẻ sự kiện chỉ xem (Teacher, Student): ô ngày, trạng thái, tiêu đề, nội dung và giờ. */
export default function EventCard({ item }: { item: EventItem }) {
  const status = getEventStatus(item);
  const d = new Date(item.eventDate);
  return (
    <View className="bg-white border border-gray-100 rounded-[28px] p-4 mb-4 flex-row shadow-sm">
      <View className={`w-16 rounded-2xl items-center justify-center py-3 self-start ${status.bg}`}>
        <Text className={`${status.color} text-2xl`} style={{ fontFamily: "Poppins-Bold" }}>
          {String(d.getDate()).padStart(2, "0")}
        </Text>
        <Text className={`${status.color} text-[10px] uppercase`} style={{ fontFamily: "Poppins-SemiBold" }}>
          Tháng {d.getMonth() + 1}
        </Text>
      </View>

      <View className="flex-1 ml-4">
        <View className="flex-row items-center gap-2 mb-1.5">
          <View className={`${status.bg} px-2.5 py-1 rounded-full`}>
            <Text className={`${status.color} text-[9px]`} style={{ fontFamily: "Poppins-Bold" }}>
              {status.label.toUpperCase()}
            </Text>
          </View>
          <Text className="text-gray-400 text-[10px]" style={{ fontFamily: "Poppins-Medium" }}>
            HK{item.term} · {item.schoolYear}
          </Text>
        </View>

        <Text className="text-gray-900 text-base leading-6" style={{ fontFamily: "Poppins-Bold" }}>
          {item.title}
        </Text>
        {item.body ? (
          <Text
            numberOfLines={3}
            className="text-gray-500 text-xs mt-1 leading-5"
            style={{ fontFamily: "Poppins-Regular" }}
          >
            {item.body}
          </Text>
        ) : null}

        <View className="flex-row items-center gap-1.5 mt-3 pt-3 border-t border-gray-50">
          <Ionicons name="time-outline" size={14} color="#136ADA" />
          <Text className="text-gray-600 text-[11px]" style={{ fontFamily: "Poppins-Medium" }}>
            {item.startTime.slice(0, 5)} - {item.finishTime.slice(0, 5)}
          </Text>
        </View>
      </View>
    </View>
  );
}
