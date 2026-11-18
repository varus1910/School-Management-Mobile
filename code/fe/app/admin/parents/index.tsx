import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";
import { useState, useEffect, useCallback } from "react";
import { parentService } from "../../../services/parent.service";
import { studentService } from "../../../services/student.service";
import { ParentInfo, ParentListItem } from "../../../types/parent";
import { StudentListItem } from "../../../types/student";
import { getErrorMessage } from "../../../utils/error";

const RELATIONSHIPS = ["Bố", "Mẹ", "Người giám hộ"];

export default function AdminParentsScreen() {
  const [parents, setParents] = useState<ParentListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  // Chi tiết phụ huynh đang quản lý
  const [selected, setSelected] = useState<ParentInfo | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Gắn thêm con
  const [childQuery, setChildQuery] = useState("");
  const [childResults, setChildResults] = useState<StudentListItem[]>([]);
  const [searchingChild, setSearchingChild] = useState(false);
  const [relationship, setRelationship] = useState("");
  const [working, setWorking] = useState(false);

  const fetchParents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await parentService.getParents({
        fullName: search || undefined,
        pageNumber: 1,
        pageSize: 50,
      });
      setParents(res.items || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchParents();
    setRefreshing(false);
  };

  const openParent = async (item: ParentListItem) => {
    try {
      setDetailLoading(true);
      setChildQuery("");
      setChildResults([]);
      setRelationship("");
      const detail = await parentService.getParentById(item.parentId);
      setSelected(detail);
    } catch (err) {
      Alert.alert("Lỗi", getErrorMessage(err));
    } finally {
      setDetailLoading(false);
    }
  };

  const reloadSelected = async (parentId: string) => {
    const detail = await parentService.getParentById(parentId);
    setSelected(detail);
    fetchParents();
  };

  const searchChildren = async () => {
    const q = childQuery.trim();
    if (!q) {
      setChildResults([]);
      return;
    }
    try {
      setSearchingChild(true);
      const res = await studentService.getStudents({
        FullName: q,
        PageNumber: 1,
        PageSize: 10,
      });
      const linked = new Set((selected?.children ?? []).map((c) => c.studentId));
      setChildResults((res.items || []).filter((st) => !linked.has(st.studentId)));
    } catch (err) {
      Alert.alert("Lỗi", getErrorMessage(err));
    } finally {
      setSearchingChild(false);
    }
  };

  const linkChild = async (student: StudentListItem) => {
    if (!selected) return;
    try {
      setWorking(true);
      await parentService.linkChild(selected.parentId, {
        studentId: student.studentId,
        relationship: relationship || undefined,
      });
      setChildResults((prev) => prev.filter((st) => st.studentId !== student.studentId));
      await reloadSelected(selected.parentId);
    } catch (err) {
      Alert.alert("Lỗi", getErrorMessage(err));
    } finally {
      setWorking(false);
    }
  };

  const unlinkChild = (studentId: string, name?: string | null) => {
    if (!selected) return;
    Alert.alert("Gỡ liên kết", `Gỡ ${name ?? "học sinh"} khỏi phụ huynh này?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Gỡ",
        style: "destructive",
        onPress: async () => {
          try {
            setWorking(true);
            await parentService.unlinkChild(selected.parentId, studentId);
            await reloadSelected(selected.parentId);
          } catch (err) {
            Alert.alert("Lỗi", getErrorMessage(err));
          } finally {
            setWorking(false);
          }
        },
      },
    ]);
  };

  return (
    <AdminPageWrapper
      title="Quản lý Phụ huynh"
      searchProps={{
        value: search,
        onChangeText: setSearch,
        placeholder: "Tìm kiếm phụ huynh...",
      }}
    >
      {/* Manage children modal */}
      <Modal
        visible={!!selected}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelected(null)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View
            className="bg-white rounded-t-[40px] px-8 py-10 shadow-2xl"
            style={{ maxHeight: "90%" }}
          >
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-1 mr-4">
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-2xl text-black"
                  numberOfLines={1}
                >
                  {selected?.fullName}
                </Text>
                <Text
                  style={{ fontFamily: "Poppins-Regular" }}
                  className="text-gray-400 text-xs"
                >
                  {selected?.phoneNumber || selected?.email || "Phụ huynh"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelected(null)}
                className="bg-gray-100 p-2 rounded-full"
              >
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-gray-500 text-xs mb-3 ml-1"
              >
                CÁC CON ĐANG LIÊN KẾT
              </Text>
              {selected?.children.length === 0 && (
                <Text
                  style={{ fontFamily: "Poppins-Regular" }}
                  className="text-gray-400 text-sm mb-4 ml-1"
                >
                  Chưa gắn học sinh nào.
                </Text>
              )}
              {selected?.children.map((c) => (
                <View
                  key={c.studentId}
                  className="flex-row items-center bg-gray-50 rounded-2xl p-4 mb-2 border border-gray-100"
                >
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: "Poppins-SemiBold" }}
                      className="text-black text-sm"
                    >
                      {c.fullName}
                    </Text>
                    <Text
                      style={{ fontFamily: "Poppins-Regular" }}
                      className="text-gray-400 text-xs"
                    >
                      {c.className ? `Lớp ${c.className}` : "Chưa có lớp"}
                      {c.relationship ? ` • ${c.relationship}` : ""}
                    </Text>
                  </View>
                  <TouchableOpacity
                    disabled={working}
                    onPress={() => unlinkChild(c.studentId, c.fullName)}
                    className="bg-red-50 p-2 rounded-full"
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}

              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-gray-500 text-xs mt-6 mb-3 ml-1"
              >
                GẮN THÊM HỌC SINH
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-3">
                {RELATIONSHIPS.map((rel) => (
                  <TouchableOpacity
                    key={rel}
                    onPress={() => setRelationship(relationship === rel ? "" : rel)}
                    className={`px-4 py-2 rounded-xl border ${
                      relationship === rel
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins-Bold",
                        fontSize: 11,
                        color: relationship === rel ? "#1D4ED8" : "#9CA3AF",
                      }}
                    >
                      {rel}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View className="flex-row items-center bg-gray-50 rounded-2xl border border-gray-100 px-4">
                <TextInput
                  value={childQuery}
                  onChangeText={setChildQuery}
                  onSubmitEditing={searchChildren}
                  placeholder="Nhập tên học sinh để tìm"
                  placeholderTextColor="#9CA3AF"
                  returnKeyType="search"
                  style={{ flex: 1, paddingVertical: 14, fontFamily: "Poppins-Regular", color: "#000" }}
                />
                <TouchableOpacity onPress={searchChildren} disabled={searchingChild}>
                  {searchingChild ? (
                    <ActivityIndicator size="small" color="#136ADA" />
                  ) : (
                    <Ionicons name="search" size={20} color="#136ADA" />
                  )}
                </TouchableOpacity>
              </View>
              {childResults.map((st) => (
                <TouchableOpacity
                  key={st.studentId}
                  disabled={working}
                  onPress={() => linkChild(st)}
                  className="flex-row items-center justify-between bg-white rounded-2xl p-4 mt-2 border border-gray-100"
                >
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: "Poppins-SemiBold" }}
                      className="text-black text-sm"
                    >
                      {st.fullName}
                    </Text>
                    <Text
                      style={{ fontFamily: "Poppins-Regular" }}
                      className="text-gray-400 text-xs"
                    >
                      {st.className ? `Lớp ${st.className}` : "Chưa có lớp"}
                    </Text>
                  </View>
                  <Ionicons name="add-circle-outline" size={22} color="#136ADA" />
                </TouchableOpacity>
              ))}
              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Parent List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={parents}
          keyExtractor={(item) => item.parentId}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingVertical: 20,
            gap: 16,
          }}
          className="bg-white"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#136ADA"
            />
          }
          ListEmptyComponent={
            <View className="items-center py-20">
              <Ionicons name="people-outline" size={48} color="#EEE" />
              <Text
                className="text-gray-400 mt-2"
                style={{ fontFamily: "Poppins-Regular" }}
              >
                Chưa có phụ huynh nào
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => openParent(item)}
              disabled={detailLoading}
              className="bg-white rounded-[32px] p-5 shadow-sm border border-gray-100 flex-row items-center"
            >
              <View className="w-14 h-14 rounded-full bg-teal-50 items-center justify-center border border-teal-100 overflow-hidden">
                {item.avatarUrl ? (
                  <Image
                    className="rounded-full"
                    source={{ uri: item.avatarUrl }}
                    style={{ width: 56, height: 56, borderRadius: 9999 }}
                    contentFit="cover"
                    transition={200}
                  />
                ) : (
                  <Text
                    style={{ fontFamily: "Poppins-Bold" }}
                    className="text-teal-600 text-xl"
                  >
                    {(item.fullName ?? "P").charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <View className="flex-1 ml-4">
                <Text
                  style={{ fontFamily: "Poppins-Bold", fontSize: 16 }}
                  className="text-black mb-1"
                >
                  {item.fullName}
                </Text>
                <View className="flex-row items-center flex-wrap gap-2">
                  <View className="bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-100">
                    <Text
                      style={{
                        fontFamily: "Poppins-Medium",
                        fontSize: 10,
                        color: "#0D9488",
                      }}
                    >
                      {item.childrenCount} con
                    </Text>
                  </View>
                  <Text
                    style={{ fontFamily: "Poppins-Regular", fontSize: 11 }}
                    className="text-gray-400"
                    numberOfLines={1}
                  >
                    {item.phoneNumber || item.email}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          )}
        />
      )}
    </AdminPageWrapper>
  );
}
