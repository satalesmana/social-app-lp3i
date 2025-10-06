import { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { router } from "expo-router";
import "../../global.css";

interface SavedPost {
  id: string;
  post_id: string;
  postingan: {
    id: string;
    email: string;
    content: string;
    image_url: string | null;
    created_at: string;
  };
}

export default function SavedScreen() {
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch saved posts
  async function fetchSavedPosts() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("saved_posts")
        .select(`
          id,
          post_id,
          postingan:post_id (
            id,
            email,
            content,
            image_url,
            created_at
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSavedPosts(data || []);
    } catch (err) {
      console.error("❌ Error fetching saved posts:", err);
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Remove a saved post
  async function unsavePost(postId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("saved_posts")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);

      if (error) throw error;

      // Update local state
      setSavedPosts(savedPosts.filter((item) => item.post_id !== postId));
    } catch (err) {
      console.error("❌ Error unsaving post:", err);
    }
  }

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  // 🔹 Loading indicator
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="gray" />
        <Text className="text-gray-500 mt-2">Loading saved posts...</Text>
      </View>
    );
  }

  // 🔹 Empty state
  if (savedPosts.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Ionicons name="bookmark-outline" size={50} color="gray" />
        <Text className="text-gray-400 mt-3">No saved posts yet</Text>
      </View>
    );
  }

  // 🔹 Render saved posts
  return (
    <ScrollView className="flex-1 bg-white">
      {savedPosts.map((item) => (
                <TouchableOpacity
          key={item.id}
          onPress={() => router.push(`/post/${item.postingan.id}`)}
          className="border-b border-gray-200 p-4"
        >
          {/* Header */}
          <View className="flex-row items-center mb-2">
            <Image
              source={{ uri: "https://randomuser.me/api/portraits/men/40.jpg" }}
              className="w-10 h-10 rounded-full mr-3"
            />
            <View className="flex-1">
              <Text className="font-bold">{item.postingan.email}</Text>
              <Text className="text-gray-500 text-sm">
                {new Date(item.postingan.created_at).toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity onPress={() => unsavePost(item.post_id)}>
              <Ionicons name="bookmark" size={22} color="#2563eb" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <Text className="mb-2">{item.postingan.content}</Text>

          {/* Image */}
          {item.postingan.image_url && (
            <Image
              source={{ uri: item.postingan.image_url }}
              className="w-full h-48 rounded-xl mb-2"
              resizeMode="cover"
            />
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
