import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";
import * as DocumentPicker from "expo-document-picker";
import { examScheduleService } from "../../../services/examSchedule.service";
import {
  ExamScheduleDetailResponse,
  ExamScheduleDetailFilterRequest,
} from "../../../types/examSchedule";
import { PagedResponse } from "../../../types/common";
import { getErrorMessage } from "../../../utils/error";

const ExamScheduleDetail = () => {
  const { id, title } = useLocalSearchParams<{ id: string; title?: string }>();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<PagedResponse<ExamScheduleDetailResponse> | null>(null);
  const [filter, setFilter] = useState<ExamScheduleDetailFilterRequest>({
    pageNumber: 1,
    pageSize: 20,
  });
  const [openMenu, setOpenMenu] = useState(false);

  const fetchData = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      const result = await examScheduleService.getScheduleDetails(id, filter);
      setData(result);
    } catch (error) {
      console.log(error);
      Alert.alert("Lỗi", "Không thể tải chi tiết ca thi");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id, filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true);
  }, [id, filter]);

  const handleImportExcel = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setLoading(true);
        const success = await examScheduleService.uploadExcel(id, file.uri);
        if (success) {
          Alert.alert("Thành công", "Đã nhập chi tiết ca thi từ file Excel thành công");
          fetchData();
        } else {
          Alert.alert("Lỗi", "Không thể nhập file Excel");
        }
      }
    } catch (error: any) {
      console.log(error);
      Alert.alert("Lỗi", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllDetails = async () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn xóa toàn bộ ca thi của lịch thi này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const success = await examScheduleService.clearScheduleDetails(id);
              if (success) {
                Alert.alert("Thành công", "Đã xóa toàn bộ ca thi thành công.");
                fetchData();
              } else {
                Alert.alert("Thất bại", "Không thể xóa ca thi.");
              }
            } catch (error: any) {
              Alert.alert("Lỗi", getErrorMessage(error));
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleAssignStudents = async () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có muốn tự động gán học sinh vào các phòng thi này không? Hành động này sẽ ghi đè lên các dữ liệu gán hiện có của lịch thi này.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Gán",
          onPress: async () => {
            try {
              setLoading(true);
              const success = await examScheduleService.triggerAssignment(id);
              if (success) {
                Alert.alert("Thành công", "Đã gán học sinh vào các phòng thi thành công");
              } else {
                Alert.alert("Thất bại", "Không thể gán học sinh");
              }
            } catch (error: any) {
              Alert.alert("Lỗi", getErrorMessage(error));
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderSlot = ({ item }: { item: ExamScheduleDetailResponse }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      className="bg-white rounded-3xl p-4 mb-3 border border-gray-100 shadow-sm flex-row"
      onPress={() => router.push(`/admin/exam-schedules/slot/${item.examScheduleDetailId}`)}
    >
      <View className="w-20 rounded-2xl bg-blue-50 items-center justify-center py-3">
        <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#136ADA] text-base">
          {item.startTime.substring(0, 5)}
        </Text>
        <View className="w-4 h-[2px] bg-blue-200 my-1" />
        <Text style={{ fontFamily: "Poppins-Medium" }} className="text-blue-400 text-xs">
          {item.finishTime.substring(0, 5)}
        </Text>
      </View>

      <View className="flex-1 ml-4 justify-center">
        <Text numberOfLines={1} style={{ fontFamily: "Poppins-Bold" }} className="text-gray-900 text-base">
          {item.subjectName}
        </Text>
        <View className="flex-row items-center mt-1">
          <Ionicons name="location-outline" size={13} color="#9CA3AF" />
          <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-xs ml-1">
            Phòng {item.roomName}
          </Text>
        </View>
        <View className="flex-row items-center justify-between mt-1">
          <View className="flex-row items-center flex-1">
            <Ionicons name="person-outline" size={13} color="#9CA3AF" />
            <Text numberOfLines={1} style={{ fontFamily: "Poppins-Regular" }} className="text-gray-500 text-xs ml-1 flex-1">
              {item.teacherName}
            </Text>
          </View>
          <Text style={{ fontFamily: "Poppins-Regular" }} className="text-gray-400 text-[10px]">
            {item.date}
          </Text>
        </View>
      </View>
      <View className="justify-center ml-1">
        <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
      </View>
    </TouchableOpacity>
  );

  const hasData = (data?.totalCount || 0) > 0;

  return (
    <TouchableWithoutFeedback onPress={() => setOpenMenu(false)}>
      <View className="flex-1">
        <AdminPageWrapper
          title={title || "Chi tiết Lịch thi"}
        >
          <View className="px-6 mt-4 flex-row justify-between items-center z-50">
            <View className="flex-row items-center">
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-900 text-lg">Ca thi</Text>
              <View className="bg-blue-50 px-3 py-0.5 rounded-full ml-2">
                <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#136ADA] text-[11px]">{data?.totalCount || 0}</Text>
              </View>
            </View>

            {/* Menu */}
            {hasData && (
              <View className="relative">
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setOpenMenu(!openMenu);
                  }}
                  className="p-1"
                >
                  <Ionicons name="ellipsis-vertical" size={20} color="#6B7280" />
                </TouchableOpacity>

                {openMenu && (
                  <View 
                    className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
                    style={{ minWidth: 150, elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setOpenMenu(false);
                        handleDeleteAllDetails();
                      }}
                      className="flex-row items-center px-4 py-3"
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                      <Text className="text-red-500 text-xs ml-2 font-bold">Xóa tất cả ca thi</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={data?.items || []}
          renderItem={renderSlot}
          keyExtractor={(item) => item.examScheduleDetailId}
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 12, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#136ADA" />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20 bg-white rounded-3xl mt-4 border border-dashed border-gray-200">
              <View className="w-20 h-20 rounded-full bg-blue-50 items-center justify-center">
                <Ionicons name="grid-outline" size={36} color="#136ADA" />
              </View>
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 mt-4 text-center px-6 text-xs">
                Lịch thi này chưa có ca thi nào được thiết lập.{"\n"}Vui lòng nhập dữ liệu từ file Excel mẫu.
              </Text>
            </View>
          }
        />
      )}

      {/* Standard Sticky Bottom Actions */}
      <View 
        className="px-6 py-4 bg-white border-t border-gray-100 flex-row gap-x-4"
        style={{ paddingBottom: 30 }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          className={`flex-1 h-14 rounded-2xl flex-row items-center justify-center ${hasData ? 'bg-gray-300' : 'bg-[#10B981] shadow-lg shadow-green-100'}`}
          onPress={handleImportExcel}
          disabled={hasData}
        >
          <Ionicons name="cloud-upload" size={22} color="white" />
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-white ml-2 text-base"
          >
            Nhập dữ liệu
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          className="flex-1 bg-[#136ADA] h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-blue-200"
          onPress={handleAssignStudents}
        >
          <Ionicons name="people" size={22} color="white" />
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-white ml-2 text-base"
          >
            Gán
          </Text>
        </TouchableOpacity>
      </View>
    </AdminPageWrapper>
    </View>
  </TouchableWithoutFeedback>
  );
};

export default ExamScheduleDetail;
