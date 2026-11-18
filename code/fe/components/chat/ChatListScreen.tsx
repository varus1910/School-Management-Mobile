import React, { useEffect, useState, memo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { conversationService } from "../../services/conversation.service";
import { ConversationResponse } from "../../types/conversation";
import { useConversationsListener } from "../../hooks/useConversationsListener";
import { useAuthStore } from "../../store/authStore";
import { userService } from "../../services/user.service";
import { UserListItem as UserType } from "../../types/user";

// --- Sub-components for better performance ---

const ConversationItem = memo(({ item, onPress, fbConvo }: { item: ConversationResponse; onPress: () => void; fbConvo?: any }) => {
  const isUnread = item.unReadCount > 0;
  const initial = item.displayName.charAt(0).toUpperCase();
  
  const getAvatarColor = (name: string) => {
    const colors = ["bg-rose-500", "bg-blue-500", "bg-teal-500", "bg-blue-500", "bg-purple-500", "bg-orange-500"];
    const index = name.length % colors.length;
    return colors[index];
  };

  const getMessageText = (msg: any) => {
    if (!msg) return null;
    if (typeof msg === "string") return msg;
    if (typeof msg === "object" && msg.content) return msg.content;
    return null;
  };

  const lastMessageText =
    getMessageText(fbConvo?.lastMessage) ||
    getMessageText(item.lastMessage) ||
    "Chạm để xem tin nhắn";

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center p-4 border-b border-gray-100 ${
        isUnread ? "bg-blue-50/60" : "bg-white"
      } active:bg-gray-50`}
    >
      <View className={`w-14 h-14 rounded-full items-center justify-center mr-4 ${!item.avatarUrl ? getAvatarColor(item.displayName) : 'bg-transparent'} shadow-sm overflow-hidden`}>
        {item.avatarUrl ? (
          <Image className="rounded-full" 
            source={{ uri: item.avatarUrl }} 
            style={{ width: 56, height: 56, borderRadius: 9999 }}
            contentFit="cover"
            transition={200}
          />
        ) : item.isGroup ? (
          <Ionicons name="people" size={24} color="white" />
        ) : (
          <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white text-lg">
            {initial}
          </Text>
        )}
      </View>

      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-1">
          <Text
            style={{ fontFamily: isUnread ? "Poppins-Bold" : "Poppins-Medium" }}
            className={`text-[15px] ${isUnread ? "text-black" : "text-gray-800"}`}
            numberOfLines={1}
          >
            {item.displayName}
          </Text>
          <Text style={{ fontFamily: "Poppins-Regular" }} className={`text-[11px] ${isUnread ? "text-[#136ADA] font-bold" : "text-gray-400"}`}>
            {new Date(fbConvo?.lastMessageAt || item.lastUpdatedAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text
            style={{ 
              fontFamily: isUnread ? "Poppins-SemiBold" : "Poppins-Regular",
              fontStyle: fbConvo?.lastMessageObj?.type === "System" ? "italic" : "normal"
            }}
            className={`text-[13px] flex-1 mr-4 ${
              isUnread ? "text-[#136ADA]" : 
              fbConvo?.lastMessageObj?.type === "System" ? "text-gray-400" : "text-gray-500"
            }`}
            numberOfLines={1}
          >
            {lastMessageText}
          </Text>
          {isUnread && (
            <View className="bg-rose-500 w-5 h-5 rounded-full items-center justify-center shadow-sm shadow-rose-200">
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white text-[10px]">
                {item.unReadCount > 99 ? "99+" : item.unReadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const UserItem = memo(({ user, onSelect }: { user: UserType; onSelect: () => void }) => {
  const getAvatarColor = (name: string) => {
    const colors = ["bg-blue-500", "bg-purple-500", "bg-blue-500", "bg-rose-500", "bg-teal-500"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <TouchableOpacity
      onPress={onSelect}
      className="flex-row items-center p-4 border-b border-gray-100 bg-white active:bg-gray-50"
    >
      <View className={`w-14 h-14 rounded-full items-center justify-center mr-4 ${!user.avatarUrl ? getAvatarColor(user.fullName) : 'bg-transparent'} shadow-sm overflow-hidden`}>
        {user.avatarUrl ? (
          <Image className="rounded-full" 
            source={{ uri: user.avatarUrl }} 
            style={{ width: 56, height: 56, borderRadius: 9999 }}
            contentFit="cover"
            transition={200}
          />
        ) : (
        <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white text-lg">
          {user.fullName.charAt(0).toUpperCase()}
        </Text>
        )}
      </View>
      <View className="flex-1">
        <Text style={{ fontFamily: "Poppins-Medium" }} className="text-[15px] text-gray-900 mb-0.5">
          {user.fullName}
        </Text>
        <View className="flex-row items-center">
          <View className="bg-blue-50 px-2 py-0.5 rounded-md mr-2">
            <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-[#136ADA] text-[10px] uppercase">
              {user.role}
            </Text>
          </View>
          <Text style={{ fontFamily: "Poppins-Regular" }} className="text-gray-400 text-xs">
            @{user.userName}
          </Text>
        </View>
      </View>
      <Ionicons name="chatbubble-outline" size={20} color="#136ADA" />
    </TouchableOpacity>
  );
});

interface ChatListScreenProps {
  rolePrefix: "admin" | "teacher" | "student" | "parent";
}

export default function ChatListScreen({ rolePrefix }: ChatListScreenProps) {
  const router = useRouter();
  const { userInfo } = useAuthStore();
  const { conversations: fbConversations } = useConversationsListener();
  const [activeTab, setActiveTab] = useState<"chats" | "users">("chats");
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchAllUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await userService.getUsers({
        FullName: debouncedSearch || undefined,
        PageNumber: 1,
        PageSize: 50,
      });
      // Filter out self
      const filtered = res.items.filter(u => u.userId !== userInfo?.id);
      setAllUsers(filtered);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchAllUsers();
    }
  }, [activeTab, debouncedSearch]);

  const fetchConversations = async () => {
    try {
      if (conversations.length === 0) setLoading(true);
      const res = await conversationService.getMyConversations({
        displayName: debouncedSearch,
      });
      setConversations(res.items);

      if (debouncedSearch.length > 1 && activeTab === "chats") {
        const userRes = await userService.getUsers({
          FullName: debouncedSearch,
          PageSize: 5,
        });
        const existingUserIds = new Set(fbConversations.flatMap((c) => c.members));
        const filteredUsers = userRes.items.filter((u) => 
          !existingUserIds.has(u.userId) && u.userId !== userInfo?.id
        );
        setUsers(filteredUsers);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [fbConversations, debouncedSearch, activeTab]);

  const handleSelectUser = async (user: UserType) => {
    try {
      setLoading(true);
      const res = await conversationService.checkConversation(user.userId);
      if (res && res.data && res.data.conversationId) {
        router.push({
          pathname: `/${rolePrefix}/chat/${res.data.conversationId}` as any,
          params: { 
            name: user.fullName, 
            isGroup: "false",
            avatarUrl: user.avatarUrl || "" 
          },
        });
      } else {
        // No existing conversation, navigate with receiverId and isNew flag
        router.push({
          pathname: `/${rolePrefix}/chat/${user.userId}` as any,
          params: { 
            isNew: "true", 
            name: user.fullName, 
            isGroup: "false",
            avatarUrl: user.avatarUrl || ""
          },
        });
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setSearch("");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header Section */}
      <View className="bg-white px-6 pt-4 pb-3">
        <View className="flex-row items-center justify-between">
          <View>
            <Text style={{ fontFamily: "Poppins-Bold" }} className="text-2xl text-gray-900">
              Tin nhắn
            </Text>
            <Text style={{ fontFamily: "Poppins-Regular" }} className="text-xs text-gray-400">
              Trò chuyện với bạn bè, thầy cô và nhà trường
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push(`/${rolePrefix}/chat/new-group` as any)}
            className="bg-[#136ADA] px-4 py-2 rounded-full shadow-sm shadow-blue-200"
          >
            <View className="flex-row items-center">
              <Ionicons name="add" size={16} color="white" />
              <Text style={{ color: "#FFFFFF", fontSize: 11, fontFamily: "Poppins-Bold", marginLeft: 2 }}>
                Nhóm
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Tab Switcher */}
        <View className="flex-row bg-gray-100 p-1 rounded-2xl mt-4">
          {(
            [
              ["chats", "Tin nhắn"],
              ["users", "Người dùng"],
            ] as const
          ).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveTab(key)}
              className={`flex-1 py-2 rounded-xl items-center ${activeTab === key ? "bg-white" : ""}`}
              style={activeTab === key ? { elevation: 2, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } } : undefined}
            >
              <Text
                style={{ fontFamily: activeTab === key ? "Poppins-SemiBold" : "Poppins-Medium" }}
                className={`text-sm ${activeTab === key ? "text-[#136ADA]" : "text-gray-400"}`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Search Input */}
      <View className="px-6 py-3">
        <View className="flex-row items-center bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-100">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder={activeTab === "chats" ? "Tìm kiếm cuộc trò chuyện..." : "Tìm kiếm người dùng..."}
            className="flex-1 ml-2 text-sm text-gray-800"
            style={{ fontFamily: "Poppins-Regular" }}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {(loading || loadingUsers) && <ActivityIndicator size="small" color="#136ADA" />}
        </View>
      </View>

      <View className="flex-1">
        {activeTab === "chats" ? (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.conversationId}
            renderItem={({ item }) => (
              <ConversationItem
                item={item}
                fbConvo={fbConversations.find((c) => c.id === item.conversationId)}
                onPress={() =>
                  router.push({
                    pathname: `/${rolePrefix}/chat/${item.conversationId}` as any,
                    params: { 
                      name: item.displayName, 
                      isGroup: item.isGroup ? "true" : "false",
                      avatarUrl: item.avatarUrl || ""
                    },
                  })
                }
              />
            )}
            removeClippedSubviews={Platform.OS === 'android'}
            maxToRenderPerBatch={10}
            initialNumToRender={10}
            windowSize={5}
            ListHeaderComponent={() =>
              debouncedSearch.length > 0 && conversations.length > 0 ? (
                <View className="px-6 py-2 bg-gray-50">
                  <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-[10px] text-gray-500 uppercase tracking-wider">
                    Kết quả trò chuyện
                  </Text>
                </View>
              ) : null
            }
            ListFooterComponent={() => (
              <View>
                {users.length > 0 && (
                  <View>
                    <View className="px-6 py-2 bg-gray-50">
                      <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-[10px] text-gray-500 uppercase tracking-wider">
                        Người dùng mới
                      </Text>
                    </View>
                    {users.map((user) => (
                      <UserItem key={user.userId} user={user} onSelect={() => handleSelectUser(user)} />
                    ))}
                  </View>
                )}
                <View className="h-20" />
              </View>
            )}
            ListEmptyComponent={() => (
              !loading && (
                <View className="flex-1 items-center justify-center p-10 mt-10">
                  <View className="bg-gray-50 p-6 rounded-full mb-4">
                    <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
                  </View>
                  <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-900 text-lg mb-1">
                    Chưa có cuộc trò chuyện nào
                  </Text>
                  <Text style={{ fontFamily: "Poppins-Regular" }} className="text-gray-500 text-center text-sm">
                    {debouncedSearch ? "Không tìm thấy kết quả phù hợp" : "Hãy bắt đầu cuộc trò chuyện với bạn bè hoặc giáo viên của bạn"}
                  </Text>
                </View>
              )
            )}
          />
        ) : (
          <FlatList
            data={allUsers}
            keyExtractor={(item) => item.userId}
            renderItem={({ item: user }) => (
              <UserItem user={user} onSelect={() => handleSelectUser(user)} />
            )}
            removeClippedSubviews={Platform.OS === 'android'}
            maxToRenderPerBatch={10}
            initialNumToRender={10}
            windowSize={5}
            ListEmptyComponent={() => (
              !loadingUsers && (
                <View className="flex-1 items-center justify-center p-10 mt-10">
                  <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                  <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-900 text-lg mt-4">
                    Không tìm thấy người dùng nào
                  </Text>
                </View>
              )
            )}
            ListFooterComponent={<View className="h-20" />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
