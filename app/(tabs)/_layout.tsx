import { Stack, router } from "expo-router";
import { View, Text, Pressable, TouchableOpacity, useWindowDimensions, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import "../../global.css";
import { useState } from "react";
import UploadModalFormData from "../../components/CreatePostModal"; // ✅ match the actual export

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [isPostModalVisible, setPostModalVisible] = useState(false);

  return (
    <View className={isDesktop ? "flex flex-row justify-center" : "flex-1"}>
      {/* 🧭 LEFT SIDEBAR (Desktop only) */}
      {isDesktop && (
        <View className="w-1/6 h-screen p-4 border-r border-gray-200">
          <Text className="text-xl font-bold mb-6">Logo</Text>

          <Pressable className="mb-4" onPress={() => router.push("/")}>
            <Text className="text-lg">Home</Text>
          </Pressable>

          <Pressable className="mb-4" onPress={() => router.push("/message")}>
            <Text className="text-lg">Message</Text>
          </Pressable>

          <Pressable className="mb-4" onPress={() => router.push("/account")}>
            <Text className="text-lg">Account</Text>
          </Pressable>

          <TouchableOpacity
            className="bg-sky-500 py-2 px-4 rounded-md mt-4"
            onPress={() => setPostModalVisible(true)}
          >
            <Text className="text-white text-center font-semibold">Tweet</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 📰 MAIN CONTENT */}
      <View className={isDesktop ? "w-2/5 h-screen border-x border-gray-200 mx-4" : "flex-1"}>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: "Home",
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/saved")}
                  style={{ marginRight: 12 }}
                >
                  <Ionicons name="bookmark-outline" size={24} color="#2563eb" />
                </TouchableOpacity>
              ),
            }}
          />
          <Stack.Screen name="saved" options={{ title: "Saved Posts" }} />
        </Stack>
      </View>

      {/* 📎 RIGHT SIDEBAR (Desktop only) */}
      {isDesktop && (
        <View className="w-1/6 h-screen p-4">
          <Text className="text-gray-500">Right Side</Text>
        </View>
      )}

      {/* 📝 CREATE POST MODAL */}
      <UploadModalFormData
        visible={isPostModalVisible}
        onClose={() => setPostModalVisible(false)}
      />

      {/* ✨ MOBILE FLOATING BUTTON */}
      {!isDesktop && (
        <TouchableOpacity
          onPress={() => setPostModalVisible(true)}
          className="absolute bottom-6 right-6 bg-sky-500 p-4 rounded-full shadow-lg"
        >
          <Ionicons name="create-outline" size={28} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}
