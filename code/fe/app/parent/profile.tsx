import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { parentService } from "../../services/parent.service";
import { useAuthStore } from "../../store/authStore";
import { ParentInfo } from "../../types/parent";
import { getErrorMessage } from "../../utils/error";
import { InfoField, ProfileHero } from "../../components/ui/ProfileParts";
import { PageHeader } from "../../components/ui/PageHeader";

export default function ParentProfileScreen() {
  const { clearAuth, updateUserInfo } = useAuthStore();
  const [profile, setProfile] = useState<ParentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    birthday: "",
    avatarUri: "",
    avatarFile: null as any,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await parentService.getMe();
      setProfile(data);
    } catch (error) {
      console.log("Error loading parent profile:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin cá nhân.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const openEdit = () => {
    if (!profile) return;
    setEditForm({
      fullName: profile.fullName || "",
      email: profile.email || "",
      phoneNumber: profile.phoneNumber || "",
      address: profile.address || "",
      birthday: profile.birthday ? profile.birthday.split("T")[0] : "",
      avatarUri: profile.avatarUrl || "",
      avatarFile: null,
    });
    setEditVisible(true);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setEditForm((prev) => ({
        ...prev,
        avatarUri: asset.uri,
        avatarFile: {
          uri: asset.uri,
          type: asset.mimeType || "image/jpeg",
          name: asset.fileName || "avatar.jpg",
        },
      }));
    }
  };

  const handleSave = async () => {
    if (!editForm.fullName || !editForm.email) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ Họ tên và Email.");
      return;
    }
    
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("FullName", editForm.fullName);
      formData.append("Email", editForm.email);
      if (editForm.phoneNumber) formData.append("PhoneNumber", editForm.phoneNumber);
      if (editForm.address) formData.append("Address", editForm.address);
      if (editForm.birthday) formData.append("Birthday", editForm.birthday);
      if (editForm.avatarFile) {
        formData.append("Avatar", editForm.avatarFile as any);
      }

      const updated = await parentService.updateMe(formData as any);
      setProfile(updated);
      
      // Update global auth store to reflect changes in SideMenu/Headers
      updateUserInfo({
        fullName: updated.fullName ?? undefined,
        avatarUrl: updated.avatarUrl
      });
      
      setEditVisible(false);
      Alert.alert("Thành công", "Cập nhật hồ sơ thành công!");
    } catch (error: any) {
      Alert.alert("Lỗi", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="bg-white">
        <PageHeader
          title="Hồ sơ"
          right={
            <TouchableOpacity
              onPress={openEdit}
              className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center"
            >
              <Ionicons name="create-outline" size={20} color="#136ADA" />
            </TouchableOpacity>
          }
        />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <ProfileHero
            name={profile?.fullName || "Phụ huynh"}
            avatarUrl={profile?.avatarUrl}
            roleLabel="Phụ huynh"
            fallbackInitial={profile?.fullName?.charAt(0) || "P"}
          />

          {/* Details Section */}
          <View className="px-6 pt-6 pb-4 gap-3">
            <InfoField label="Email" value={profile?.email ?? "—"} icon="mail-outline" />
            <InfoField label="Số điện thoại" value={profile?.phoneNumber ?? "—"} icon="call-outline" />
            <InfoField label="Địa chỉ" value={profile?.address ?? "—"} icon="location-outline" />
            <InfoField 
              label="Ngày sinh" 
              value={profile?.birthday ? new Date(profile.birthday).toLocaleDateString("en-GB") : "—"} 
              icon="calendar-outline" 
            />
          </View>


          {profile?.children?.length ? (
            <View className="px-6 pb-10 gap-3">
              <Text
                style={{ fontFamily: "Poppins-SemiBold" }}
                className="text-gray-500 text-xs uppercase tracking-widest"
              >
                Con của bạn
              </Text>
              {profile.children.map((c) => (
                <View key={c.studentId} className="flex-row items-center bg-gray-50 p-4 rounded-2xl border border-white">
                  <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-4">
                    <Ionicons name="school-outline" size={20} color="#136ADA" />
                  </View>
                  <View className="flex-1">
                    <Text style={{ fontFamily: "Poppins-Medium" }} className="text-black text-sm">
                      {c.fullName}
                    </Text>
                    <Text style={{ fontFamily: "Poppins-Regular" }} className="text-gray-400 text-xs">
                      {c.className ? `Lớp ${c.className}` : "Chưa có lớp"}
                      {c.relationship ? ` • ${c.relationship}` : ""}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

        </ScrollView>
      )}

      {/* Edit Modal */}
      <Modal visible={editVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
            <TouchableOpacity onPress={() => setEditVisible(false)}>
              <Text className="text-gray-500 text-base" style={{ fontFamily: "Poppins-Regular" }}>
                Hủy
              </Text>
            </TouchableOpacity>
            <Text className="text-black text-base" style={{ fontFamily: "Poppins-Bold" }}>
              Chỉnh sửa thông tin
            </Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#136ADA" />
              ) : (
                <Text className="text-blue-600 text-base" style={{ fontFamily: "Poppins-SemiBold" }}>
                  Lưu
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : undefined} 
            className="flex-1"
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
                {/* Note Banner */}
                <View className="bg-blue-50 rounded-xl px-4 py-3 mb-5 flex-row gap-2">
                  <Ionicons name="information-circle-outline" size={18} color="#136ADA" />
                  <Text style={{ fontFamily: "Poppins-Regular" }} className="text-bright-blue text-xs flex-1">
                    Bạn chỉ có thể thay đổi Ảnh đại diện, Họ tên, Email, SĐT, Địa chỉ và Ngày sinh. Việc gắn học sinh (con) do nhà trường quản lý.
                  </Text>
                </View>

                <View className="items-center mb-6">
                  <TouchableOpacity onPress={pickImage} className="w-24 h-24 rounded-full bg-blue-50 items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                    {editForm.avatarUri ? (
                      <Image source={{ uri: editForm.avatarUri }} className="w-24 h-24 rounded-full" />
                    ) : (
                      <Ionicons name="camera-outline" size={32} color="#136ADA" />
                    )}
                  </TouchableOpacity>
                  <Text className="text-blue-600 mt-2 text-xs" style={{ fontFamily: "Poppins-Medium" }}>Thay đổi ảnh đại diện</Text>
                </View>

                <View className="gap-5 pb-20">
                  <EditInput label="Họ và tên" value={editForm.fullName} onChangeText={(v: string) => setEditForm({ ...editForm, fullName: v })} />
                  <EditInput label="Email" value={editForm.email} onChangeText={(v: string) => setEditForm({ ...editForm, email: v })} keyboardType="email-address" />
                  <EditInput label="Số điện thoại" value={editForm.phoneNumber} onChangeText={(v: string) => setEditForm({ ...editForm, phoneNumber: v })} keyboardType="phone-pad" />
                  <EditInput label="Địa chỉ" value={editForm.address} onChangeText={(v: string) => setEditForm({ ...editForm, address: v })} />
                  <EditInput label="Ngày sinh (Năm-Tháng-Ngày)" value={editForm.birthday} onChangeText={(v: string) => setEditForm({ ...editForm, birthday: v })} placeholder="1990-01-01" />
                </View>
              </ScrollView>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function EditInput({ label, value, onChangeText, ...props }: { label: string; value: string; onChangeText: (v: string) => void; [key: string]: any }) {
  return (
    <View className="gap-1">
      <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs ml-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-black text-sm"
        style={{ fontFamily: 'Poppins-Regular' }}
        {...props}
      />
    </View>
  );
}
