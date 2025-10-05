import React, { useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import "../../global.css";
import { addRepost } from "../../lib/supabase";
import { supabase } from "../../lib/supabase";

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
  const [posts, setPosts] = useState(initialPosts);
  const [repostedPosts, setRepostedPosts] = useState<string[]>([]);

  const getUserId = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      console.log("Error get user:", error);
      return null;
    }
    return data.user.id;
  };

  const handleRepost = async (postId: string) => {
    const userId = await getUserId();
    if (!userId) {
      Alert.alert("Gagal", "Kamu harus login untuk repost.");
      return;
    }

    // cek apakah sudah direpost
    if (repostedPosts.includes(postId)) {
      Alert.alert("Info", "Kamu sudah merepost postingan ini.");
      return;
    }

    const res = await addRepost(postId, userId);
    if (res) {
      // update jumlah share di state post
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId ? { ...p, shares: Number(p.shares) + 1 } : p
        )
      );

      // update state repostedPosts
      setRepostedPosts((prev) => [...prev, postId]);

      Alert.alert("Berhasil!", "Postingan berhasil direpost 🎉");
    } else {
      Alert.alert("Error", "Gagal menambahkan repost, coba lagi.");
    }
  };

  return (
    <ScrollView>
      {posts.map((post) => {
        const isReposted = repostedPosts.includes(post.id);

        return (
          <View key={post.id} className="border-b border-gray-200 p-4">
            {/* Header */}
            <View className="flex-row items-center mb-2">
              <Image
                source={{ uri: "https://randomuser.me/api/portraits/women/44.jpg" }}
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
  );
}
