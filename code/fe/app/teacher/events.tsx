import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import { AdminPageWrapper } from "../../components/ui/AdminPageWrapper";
import { eventService } from "../../services/event.service";
import { EventItem } from "../../types/event";
import { useConfigStore } from "../../store/configStore";
import EventCard from "../../components/events/EventCard";

export default function TeacherEventsPage() {
  const { schoolYear, term } = useConfigStore();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'Tất cả' | 'Sắp tới' | 'Đang diễn ra' | 'Đã kết thúc'>('Tất cả');

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await eventService.getEvents({ 
        Title: search || undefined,
        SchoolYear: schoolYear, 
        Term: term 
      });
      setEvents(response.items);
    } catch (error) {
      console.log("Error fetching events:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, schoolYear, term]);

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [fetchEvents])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const filteredEvents = events.filter(e => {
    if (activeTab === 'Tất cả') return true;
    const now = new Date();
    const s = new Date(`${e.eventDate}T${e.startTime}`);
    const f = new Date(`${e.eventDate}T${e.finishTime}`);
    if (activeTab === 'Sắp tới') return now < s;
    if (activeTab === 'Đã kết thúc') return now > f;
    if (activeTab === 'Đang diễn ra') return now >= s && now <= f;
    return true;
  });

  return (
    <AdminPageWrapper 
      title="Sự kiện trường học"
      searchProps={{
        value: search,
        onChangeText: setSearch,
        placeholder: "Tìm kiếm sự kiện..."
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Tabs */}
      <View className="flex-row bg-white border-b border-gray-100 px-6 py-3 gap-2">
         {['Tất cả', 'Sắp tới', 'Đang diễn ra', 'Đã kết thúc'].map((t: any) => (
           <TouchableOpacity 
              key={t} onPress={() => setActiveTab(t)}
              className={`px-4 py-1.5 rounded-full ${activeTab === t ? 'bg-[#136ADA]' : 'bg-gray-50'}`}
           >
              <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 10, color: activeTab === t ? 'white' : '#9CA3AF' }}>{t.toUpperCase()}</Text>
           </TouchableOpacity>
         ))}
      </View>

      {/* Event List */}
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.eventId}
        className="bg-[#F8FAFC]"
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => <EventCard item={item} />}
        ListEmptyComponent={
          loading && !refreshing ? <ActivityIndicator size="large" color="#136ADA" className="mt-20" /> : (
            <View className="items-center justify-center mt-20">
              <View className="bg-blue-50 w-20 h-20 rounded-full items-center justify-center mb-4">
                <Ionicons name="calendar-outline" size={36} color="#136ADA" />
              </View>
              <Text className="text-gray-400 text-center" style={{ fontFamily: "Poppins-Medium" }}>Không tìm thấy sự kiện</Text>
              <Text className="text-gray-300 text-[10px] mt-1 text-center" style={{ fontFamily: "Poppins-Regular" }}>Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</Text>
            </View>
          )
        }
      />
    </AdminPageWrapper>
  );
}
