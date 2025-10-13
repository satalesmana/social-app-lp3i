import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import PostModal from "../../components/PostModal"; // pastikan path benar
import "../../global.css";

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isPostModalVisible, setIsPostModalVisible] = useState(false);

  // 🔹 Ambil data dari Supabase
  const fetchPosts = async () => {
    if (!refreshing) setLoading(true);

    const { data, error } = await supabase
      .from("postingan")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetch posts:", error);
    } else {
      setPosts(data || []);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPosts();

    // 🔥 Realtime listener (update otomatis saat ada post baru)
    const channel = supabase
      .channel("postingan-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "postingan" },
        () => fetchPosts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="blue" />
        <Text className="mt-2 text-gray-500">Memuat postingan...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchPosts} />
        }
        className="bg-white"
      >
        {posts.length === 0 ? (
          <View className="flex-1 items-center justify-center p-10">
            <Text className="text-gray-500">Belum ada postingan 😢</Text>
          </View>
        ) : (
          posts.map((post) => (
            <View key={post.id} className="border-b border-gray-200 p-4">
              {/* 🔹 Header */}
              <View className="flex-row items-center mb-2">
                <Image
                  source={{
                    uri:
                      post.profile_url ||
                      "https://randomuser.me/api/portraits/men/32.jpg",
                  }}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <View>
                  <Text className="font-bold text-gray-900">
                    {post.email.split("@")[0]}
                  </Text>
                  <Text className="text-gray-500">@{post.email}</Text>
                </View>
              </View>

              {/* 🔹 Konten */}
              {post.content ? (
                <Text className="mb-2 text-gray-800">{post.content}</Text>
              ) : null}

              {/* 🔹 Gambar */}
              {post.image_url ? (
                <Image
                  source={{ uri: post.image_url }}
                  className="w-full h-48 rounded-xl mb-2"
                  resizeMode="cover"
                />
              ) : null}

              {/* 🔹 Aksi */}
              <View className="flex-row justify-between mt-2">
                <View className="flex-row items-center space-x-1">
                  <Ionicons name="chatbubble-outline" size={20} color="gray" />
                  <Text className="text-gray-500">12</Text>
                </View>

                <View className="flex-row items-center space-x-1">
                  <Ionicons name="repeat" size={20} color="gray" />
                  <Text className="text-gray-500">8</Text>
                </View>

                <View className="flex-row items-center space-x-1">
                  <Ionicons name="heart-outline" size={20} color="gray" />
                  <Text className="text-gray-500">32</Text>
                </View>

                <Feather name="share" size={20} color="gray" />
              </View>

              {/* 🔹 Waktu posting */}
              <Text className="text-gray-400 text-xs mt-2">
                {new Date(post.created_at).toLocaleString("id-ID")}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* 🔹 Floating Button hanya muncul di Mobile */}
      {Platform.OS !== "web" && (
        <TouchableOpacity
          onPress={() => setIsPostModalVisible(true)}
          style={{
            position: "absolute",
            bottom: 24,
            right: 24,
            backgroundColor: "#1DA1F2",
            borderRadius: 50,
            width: 60,
            height: 60,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 3 },
            shadowRadius: 5,
            elevation: 8,
          }}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      )}

      {/* 🔹 Modal Posting */}
      <PostModal
        visible={isPostModalVisible}
        onClose={() => setIsPostModalVisible(false)}
      />
    </View>
  );
}
