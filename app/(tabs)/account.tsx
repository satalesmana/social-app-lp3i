import { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, Pressable, Alert, Platform, ActivityIndicator } from "react-native";
import { supabase } from "../../lib/supabase";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AccountPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Ambil data user dari Supabase
  const fetchUserData = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();

    if (userData?.user) {
      setUserEmail(userData.user.email || null);

      // cek avatar dari tabel profiles (kalau ada)
      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", userData.user.id)
        .single();

      if (profile?.avatar_url) {
        setAvatarUrl(profile.avatar_url);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserData();

    // Listener realtime untuk update profile
    const channel = supabase
      .channel("profile-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          fetchUserData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Logout
  const onSignOut = async () => {
    if (Platform.OS === "web") {
      const confirm = window.confirm("Apakah kamu yakin ingin logout?");
      if (confirm) {
        const { error } = await supabase.auth.signOut({ scope: "local" });
        if (!error) router.replace("login");
      }
    } else {
      Alert.alert("Konfirmasi Logout", "Apakah kamu yakin ingin keluar?", [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Logout",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase.auth.signOut({ scope: "local" });
            if (!error) router.replace("login");
          },
        },
      ]);
    }
  };

  const onEditProfile = () => {
    router.push("edit-profile");
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="blue" />
        <Text>Memuat data akun...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="bg-white flex-1">
      {/* Cover */}
      <View className="w-full h-32 bg-sky-500" />

      {/* Profile Section */}
      <View className="px-4 -mt-12">
        <Image
          source={{
            uri: avatarUrl
              ? avatarUrl
              : "https://i.pravatar.cc/150?img=5", // fallback avatar
          }}
          className="w-24 h-24 rounded-full border-4 border-white"
        />

        {/* Email User */}
        <Text className="text-lg font-bold mt-2">
          {userEmail ? `Selamat datang ${userEmail}` : "Selamat datang!"}
        </Text>
        <Text className="text-gray-500">@username_demo</Text>

        <Text className="mt-2 text-sm text-gray-700">
          Just a simple bio here ✨ | Developer | Coffee Lover ☕
        </Text>

        {/* Divider */}
        <View className="border-b border-gray-200 mt-4" />

        {/* Posts Tabs */}
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
            <Ionicons name="create-outline" size={18} color="#555" />
            <Text className="font-semibold text-gray-700 mt-1">Edit Profile</Text>
          </Pressable>

          <Pressable
            onPress={onSignOut}
            className="flex-1 py-2 rounded-2xl bg-[#911b03] flex items-center justify-center"
          >
            <Ionicons name="log-out-outline" size={18} color="white" />
            <Text className="font-semibold text-white mt-1">Logout</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
