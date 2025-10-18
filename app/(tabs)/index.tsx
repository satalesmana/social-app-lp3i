import { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import "../../global.css";

interface Post {
  id: string;
  email: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  async function fetchPosts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("postingan")
        .select("id, email, content, image_url, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
      await fetchSavedPosts();
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSavedPosts() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("saved_posts")
      .select("post_id")
      .eq("user_id", user.id);

    if (!error && data) {
      setSavedPosts(data.map((item) => item.post_id));
    }
  }

  async function toggleSave(postId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please log in to save posts");

    if (savedPosts.includes(postId)) {
      // unsave
      await supabase
        .from("saved_posts")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);
      setSavedPosts(savedPosts.filter((id) => id !== postId));
    } else {
      // save
      await supabase
        .from("saved_posts")
        .insert([{ user_id: user.id, post_id: postId }]);
      setSavedPosts([...savedPosts, postId]);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="gray" />
        <Text className="mt-2 text-gray-500">Loading posts...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">

      {/* Post list */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {posts.length === 0 ? (
          <View className="p-6 items-center">
            <Text className="text-gray-400">No posts yet</Text>
          </View>
        ) : (
          posts.map((post) => (
            <View key={post.id} className="border-b border-gray-200 p-4">
              {/* Header */}
              <View className="flex-row items-center mb-2">
                <Image
                  source={{
                    uri: "https://randomuser.me/api/portraits/men/45.jpg",
                  }}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <View className="flex-1">
                  <Text className="font-bold">{post.email}</Text>
                  <Text className="text-gray-500 text-sm">
                    {new Date(post.created_at).toLocaleString()}
                  </Text>
                </View>

                {/* Save button */}
                <TouchableOpacity onPress={() => toggleSave(post.id)}>
                  <Ionicons
                    name={savedPosts.includes(post.id) ? "bookmark" : "bookmark-outline"}
                    size={22}
                    color={savedPosts.includes(post.id) ? "#2563eb" : "gray"}
                  />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <Text className="mb-2">{post.content}</Text>

              {post.image_url && (
                <Image
                  source={{ uri: post.image_url }}
                  className="w-full h-48 rounded-xl mb-2"
                  resizeMode="cover"
                />
              )}

              {/* Actions */}
              <View className="flex-row justify-between mt-2">
                <View className="flex-row items-center space-x-1">
                  <Ionicons name="chatbubble-outline" size={20} color="gray" />
                  <Text className="text-gray-500">0</Text>
                </View>
                <View className="flex-row items-center space-x-1">
                  <Ionicons name="heart-outline" size={20} color="gray" />
                  <Text className="text-gray-500">0</Text>
                </View>
                <Feather name="share" size={20} color="gray" />
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
