import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AlertDialog } from "../../components/global/Alert";

export default function AccountPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const fetchUserData = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();

    if (userData?.user) {
      setUserEmail(userData.user.email || null);

      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", userData.user.id)
        .single();

      if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUserData();

    // ✅ Pantau perubahan avatar hanya untuk user login
    const subscribeProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const channel = supabase
        .channel("profile-updates")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${userData.user.id}`, // hanya user ini
          },
          (payload) => {
            if (payload.new?.avatar_url) {
              setAvatarUrl(payload.new.avatar_url); // update langsung avatar
            }
          }
        )
        .subscribe();

      return channel;
    };

    const channelPromise = subscribeProfile();

    return () => {
      channelPromise.then((ch) => {
        if (ch) supabase.removeChannel(ch);
      });
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (!error) {
      setShowLogoutAlert(false);
      router.replace("login");
    }
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
      <View className="w-full h-32 bg-sky-500" />

      <View className="px-4 -mt-12">
        <Image
          source={{
            uri: avatarUrl || "https://i.pravatar.cc/150?img=5",
          }}
          className="w-24 h-24 rounded-full border-4 border-white"
        />

        <Text className="text-lg font-bold mt-2">
          {userEmail ? `Selamat datang ${userEmail}` : "Selamat datang!"}
        </Text>
        <Text className="text-gray-500">@username_demo</Text>

        <Text className="mt-2 text-sm text-gray-700">
          Just a simple bio here ✨ | Developer | Coffee Lover ☕
        </Text>

        <View className="border-b border-gray-200 mt-4" />

        <View className="flex-row justify-around py-3">
          <Text className="font-semibold text-green-600">Posts</Text>
          <Text className="text-gray-500">Replies</Text>
          <Text className="text-gray-500">Media</Text>
          <Text className="text-gray-500">Likes</Text>
        </View>

        <View className="border-t border-gray-200">
          {[1, 2, 3].map((item) => (
            <View
              key={item}
              className="flex-row px-4 py-3 border-b border-gray-200"
            >
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

        <View className="flex-row mt-4 space-x-3">
          <Pressable
            onPress={() => router.push("edit-profile")}
            className="flex-1 py-2 rounded-2xl border border-gray-300 flex items-center justify-center"
          >
            <Ionicons name="create-outline" size={18} color="#555" />
            <Text className="font-semibold text-gray-700 mt-1">
              Edit Profile
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setShowLogoutAlert(true)}
            className="flex-1 py-2 rounded-2xl bg-[#911b03] flex items-center justify-center"
          >
            <Ionicons name="log-out-outline" size={18} color="white" />
            <Text className="font-semibold text-white mt-1">Logout</Text>
          </Pressable>
        </View>
      </View>

      {/* 🔔 Alert Logout */}
      <AlertDialog
        visible={showLogoutAlert}
        title="Konfirmasi Logout"
        message="Apakah kamu yakin ingin keluar dari akun ini?"
        onClose={() => setShowLogoutAlert(false)}
        actions={[
          {
            text: "Batal",
            style: "cancel",
            onPress: () => setShowLogoutAlert(false),
          },
          {
            text: "Ya, Logout",
            style: "destructive",
            onPress: handleLogout,
          },
        ]}
      />
    </ScrollView>
  );
}
