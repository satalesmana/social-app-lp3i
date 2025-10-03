import { FontAwesome5, Feather } from "@expo/vector-icons";
import { View, Text, Image, ScrollView, TouchableOpacity, Pressable, Alert, Platform } from "react-native";
import { supabase } from "../../lib/supabase";
import { router } from "expo-router";

export default function AccountPage() {
  const onSignOut = async () => {
    if (Platform.OS === "web") {
      const confirm = window.confirm("Apakah kamu yakin ingin logout?");
      if (confirm) {
        const { error } = await supabase.auth.signOut({ scope: "local" });
        if (!error) {
          router.replace("login");
        }
      }
    } else {
      Alert.alert("Konfirmasi Logout", "Apakah kamu yakin ingin keluar?", [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Logout",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase.auth.signOut({ scope: "local" });
            if (!error) {
              router.replace("login");
            }
          },
        },
      ]);
    }
  };

  const onEditProfile = () => {
    router.push("edit-profile");
  };

  return (
    <ScrollView className="bg-white flex-1">
      {/* Cover */}
      <View className="w-full h-32 bg-blue-500" />

      {/* Profile Section */}
      <View className="px-4 -mt-12">
        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=5" }}
          className="w-24 h-24 rounded-full border-4 border-white"
        />
        <Text className="text-lg font-bold mt-2">adi</Text>
        <Text className="text-gray-500">@bill_demo</Text>
        <Text className="mt-2 text-sm text-gray-700">
          Just a simple bio here ✨ | Developer | Coffee Lover ☕
        </Text>

        {/* Stats */}
        <View className="flex-row space-x-6 mt-3">
          <Text>
            <Text className="font-bold">123</Text> Following
          </Text>
          <Text>
            <Text className="font-bold">456</Text> Followers
          </Text>
        </View>


      {/* Divider */}
      <View className="border-b border-gray-200 mt-4" />

      {/* Sample Tabs */}
      <View className="flex-row justify-around py-3">
        <Text className="font-semibold text-green-600">Posts</Text>
        <Text className="text-gray-500">Replies</Text>
        <Text className="text-gray-500">Media</Text>
        <Text className="text-gray-500">Likes</Text>
      </View>

      {/* Post List Example */}
      <View className="border-t border-gray-200">
        {[1, 2, 3].map((item) => (
          <View key={item} className="flex-row px-4 py-3 border-b border-gray-200">
            <Image
              source={{ uri: "https://i.pravatar.cc/100?img=12" }}
              className="w-10 h-10 rounded-full mr-3"
            />
            <View className="flex-1">
              <Text className="font-semibold">Bill</Text>
              <Text className="text-gray-700">
                Ini contoh postingan ke-{item} yang tampil di profil 🚀
              </Text>
            </View>
          </View>
        ))}
      </View>
        {/* Edit Profile & Logout */}
          <View className="flex-row mt-4 space-x-3">
            <Pressable
              onPress={onEditProfile}
              className="flex-1 py-2 rounded-2xl border border-gray-300 flex items-center justify-center"
            >
              <Text className="font-semibold text-gray-700">Edit Profile</Text>
            </Pressable>

          <Pressable
            onPress={onSignOut}
            className="flex-1 py-2 rounded-2xl bg-[#911b03] flex items-center justify-center"
          >
            <Text className="font-semibold text-white">Logout</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
