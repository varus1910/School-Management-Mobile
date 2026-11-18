import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { parentService } from '../../services/parent.service';
import { FeeDetailResponse } from '../../types/fee';
import { useConfigStore } from '../../store/configStore';
import { useSelectedChild } from '../../store/parentStore';
import ChildSwitcher from '../../components/parent/ChildSwitcher';

export default function ParentFeesScreen() {
  const { schoolYear } = useConfigStore();
  const child = useSelectedChild();
  const [fees, setFees] = useState<FeeDetailResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const loadFees = useCallback(async () => {
    if (!child) {
      setFees([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      setLoading(true);
      const response = await parentService.getChildFees(child.studentId, {
        schoolYear,
        pageSize: 50,
      });
      setFees(response.items);
    } catch (err) {
      console.log(err);
      setFees([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [child?.studentId, schoolYear]);

  useFocusEffect(
    useCallback(() => {
      loadFees();
    }, [loadFees])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadFees();
  };

  const totalDue = fees.reduce(
    (acc, curr) => (curr.status !== 'Đã đóng' ? acc + curr.amountDue : acc),
    0,
  );

  return (
    <View className="flex-1 bg-[#F8FAFC]">

      {/* Premium Header */}
      <View
        className="bg-white px-6 pb-6 shadow-sm shadow-gray-200"
        style={{ paddingTop: insets.top + 10 }}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center border border-gray-100"
          >
            <Ionicons name="arrow-back" size={20} color="#1E293B" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-[#1E293B] text-lg">Học phí & Lệ phí</Text>
          <View className="w-10" />
        </View>
      </View>

      <ChildSwitcher />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />
        }
      >
        {!loading && fees.length > 0 && (
          <View className="rounded-[28px] p-5 mb-5" style={{ backgroundColor: "#136ADA" }}>
            <Text style={{ fontFamily: "Poppins-Medium" }} className="text-white/80 text-xs uppercase tracking-widest">
              Tổng cần đóng
            </Text>
            <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white text-3xl mt-1">
              {totalDue.toLocaleString()} <Text className="text-base">VNĐ</Text>
            </Text>
            <View className="h-2 bg-white/25 rounded-full overflow-hidden mt-4">
              <View
                className="h-full bg-white"
                style={{ width: `${(fees.filter((f) => f.status === "Đã đóng").length / fees.length) * 100}%` }}
              />
            </View>
            <Text style={{ fontFamily: "Poppins-Medium" }} className="text-white/80 text-xs mt-2">
              {fees.filter((f) => f.status !== "Đã đóng").length} khoản chưa đóng •{" "}
              {fees.filter((f) => f.status === "Đã đóng").length} khoản đã đóng
            </Text>
            <Text style={{ fontFamily: "Poppins-Regular" }} className="text-white/70 text-[10px] mt-3">
              Học sinh thanh toán học phí trong ứng dụng hoặc đóng trực tiếp tại trường.
            </Text>
          </View>
        )}

        {loading && !refreshing ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : fees.length === 0 ? (
          <EmptyState />
        ) : (
          fees.map((item) => <FeeCard key={item.id} data={item} />)
        )}
      </ScrollView>
    </View>
  );
}

function FeeCard({ data }: { data: FeeDetailResponse }) {
  const isPaid = data.status === 'Đã đóng';

  return (
    <View
      className="bg-white rounded-[28px] p-5 mb-4 shadow-sm shadow-gray-100 border border-gray-100"
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1 mr-4">
          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-[#1E293B] text-base leading-tight">
            {data.reason}
          </Text>
          <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-xs mt-1">
            Năm học {data.schoolYear}
          </Text>
        </View>
        <View className={`px-4 py-1.5 rounded-full ${isPaid ? 'bg-green-50' : 'bg-red-50'}`}>
          <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 10 }} className={isPaid ? 'text-green-600' : 'text-red-600'}>
            {isPaid ? 'ĐÃ ĐÓNG' : 'CHƯA ĐÓNG'}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center py-4 border-t border-gray-50">
        <View>
          <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-[10px] uppercase tracking-widest">Số tiền</Text>
          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-[#1E293B] text-lg">
            {data.amountDue.toLocaleString()} <Text className="text-sm font-normal text-gray-400">VNĐ</Text>
          </Text>
        </View>
      </View>

      {isPaid && data.paidAt && (
        <View className="bg-gray-50/80 rounded-2xl p-3 mt-1">
          <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 11 }} className="text-gray-500">
            Thanh toán lúc: <Text className="text-gray-800">{new Date(data.paidAt).toLocaleDateString()}</Text>
          </Text>
        </View>
      )}
    </View>
  );
}

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-4">
        <Ionicons name="card-outline" size={32} color="#CBD5E1" />
      </View>
      <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-[#1E293B] text-lg">Không có khoản phí nào</Text>
      <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-center mt-2 px-10">
        Hiện tại con bạn không có khoản học phí hay lệ phí nào.
      </Text>
    </View>
  );
}
