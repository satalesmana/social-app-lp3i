import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // ✅ untuk navigasi ke halaman reposts
import "../../global.css";
import { addRepost, supabase } from "../../lib/supabase";

const initialPosts = [
  {
    id: "1",
    user: "Devon Lane",
    handle: "@johndue",
    text: "Tom is in a big hurry.",
    image: "https://picsum.photos/500/300",
    likes: "6.2K",
    comments: 61,
    shares: 12,
  },
  {
    id: "2",
    user: "Darlene Robertson",
    handle: "@johndue",
    text: "Nature always wears the colors of the spirit.",
    image: "https://picsum.photos/500/301",
    likes: "3.1K",
    comments: 44,
    shares: 5,
  },
  {
    id: "3",
    user: "Leslie Alexander",
    handle: "@leslie",
    text: "Enjoying my morning coffee ☕",
    image: "https://picsum.photos/500/302",
    likes: "1.2K",
    comments: 12,
    shares: 2,
  },
  {
    id: "4",
    user: "Jenny Wilson",
    handle: "@jennyw",
    text: "Weekend vibes 😎",
    image: "https://picsum.photos/500/303",
    likes: "8.2K",
    comments: 102,
    shares: 31,
  },
];

export default function HomeScreen() {
  const router = useRouter(); // ✅
  const [posts, setPosts] = useState(initialPosts);
  const [repostedPosts, setRepostedPosts] = useState<string[]>([]);
  const [userReposts, setUserReposts] = useState<any[]>([]);

  const getUserId = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      console.log("Error get user:", error);
      return null;
    }
    return data.user.id;
  };

  useEffect(() => {
    const fetchReposts = async () => {
      const userId = await getUserId();
      if (!userId) return;

      const { data, error } = await supabase
        .from("reposts")
        .select("post_id, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reposts:", error);
      } else {
        setRepostedPosts(data.map((item) => item.post_id));
        const reposted = initialPosts.filter((p) =>
          data.some((d) => d.post_id === p.id)
        );
        setUserReposts(reposted);
      }
    };

    fetchReposts();
  }, []);

  const handleRepost = async (postId: string) => {
    const userId = await getUserId();
    if (!userId) {
      Alert.alert("Gagal", "Kamu harus login untuk repost.");
      return;
    }

    if (repostedPosts.includes(postId)) {
      Alert.alert("Info", "Kamu sudah merepost postingan ini.");
      return;
    }

    const res = await addRepost(postId, userId);
    if (res) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, shares: Number(p.shares) + 1 } : p
        )
      );
      setRepostedPosts((prev) => [...prev, postId]);
      const repostedPost = posts.find((p) => p.id === postId);
      if (repostedPost) {
        setUserReposts((prev) => [repostedPost, ...prev]);
      }

      Alert.alert("Berhasil!", "Postingan berhasil direpost 🎉");
    } else {
      Alert.alert("Error", "Gagal menambahkan repost, coba lagi.");
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* ✅ HEADER dengan tombol repost */}
      <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
        <Text className="text-lg font-bold">Home</Text>
        <TouchableOpacity onPress={() => router.push("/reposts")}>
          <Feather name="repeat" size={22} color="gray" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* 🔁 Repost Kamu */}
        {userReposts.length > 0 && (
          <View className="bg-gray-100 p-4 mb-4 rounded-xl mx-3 mt-3">
            <Text className="font-bold text-lg mb-2">🔁 Repost Kamu</Text>
            {userReposts.map((post) => (
              <View
                key={post.id}
                className="mb-3 bg-white p-3 rounded-xl shadow-sm"
              >
                <Text className="font-semibold text-gray-700">{post.user}</Text>
                <Text className="text-gray-500 mb-1">{post.handle}</Text>
                <Text className="text-gray-800 mb-2">{post.text}</Text>
                {post.image && (
                  <Image
                    source={{ uri: post.image }}
                    className="w-full h-36 rounded-xl"
                    resizeMode="cover"
                  />
                )}
              </View>
            ))}
          </View>
        )}

        {/* 🔽 Feed utama */}
        {posts.map((post) => {
          const isReposted = repostedPosts.includes(post.id);

          return (
            <View key={post.id} className="border-b border-gray-200 p-4">
              {/* Header */}
              <View className="flex-row items-center mb-2">
                <Image
                  source={{
                    uri: "https://randomuser.me/api/portraits/women/44.jpg",
                  }}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <View>
                  <Text className="font-bold">{post.user}</Text>
                  <Text className="text-gray-500">{post.handle}</Text>
                </View>
              </View>

              {/* Content */}
              <Text className="mb-2">{post.text}</Text>
              {post.image && (
                <Image
                  source={{ uri: post.image }}
                  className="w-full h-48 rounded-xl mb-2"
                  resizeMode="cover"
                />
              )}

              {/* Actions */}
              <View className="flex-row justify-between mt-2">
                {/* Comments */}
                <View className="flex-row items-center space-x-1">
                  <Ionicons name="chatbubble-outline" size={20} color="gray" />
                  <Text className="text-gray-500">{post.comments}</Text>
                </View>

                {/* Repost */}
                <TouchableOpacity
                  onPress={() => handleRepost(post.id)}
                  className="flex-row items-center space-x-1"
                >
                  <Ionicons
                    name="repeat"
                    size={20}
                    color={isReposted ? "#007AFF" : "gray"}
                  />
                  <Text
                    className="ml-1"
                    style={{ color: isReposted ? "#007AFF" : "gray" }}
                  >
                    {post.shares}
                  </Text>
                </TouchableOpacity>

                {/* Likes */}
                <View className="flex-row items-center space-x-1">
                  <Ionicons name="heart-outline" size={20} color="gray" />
                  <Text className="text-gray-500">{post.likes}</Text>
                </View>

                {/* Share external */}
                <Feather name="share" size={20} color="gray" />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
