import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, Image, ActivityIndicator, ScrollView } from "react-native";
import { supabase } from "../../../lib/supabase";

export default function PostDetail() {
  const { id } = useLocalSearchParams(); // post_id from navigation
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchPost() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("postingan")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (err) {
      console.error("❌ Error fetching post:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) fetchPost();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="gray" />
      </View>
    );
  }

  if (!post) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>No post found.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="mb-4">
        <Text className="text-lg font-bold mb-1">{post.email}</Text>
        <Text className="text-gray-500 text-sm mb-3">
          {new Date(post.created_at).toLocaleString()}
        </Text>
        <Text className="text-base mb-3">{post.content}</Text>

        {post.image_url && (
          <Image
            source={{ uri: post.image_url }}
            className="w-full h-60 rounded-xl"
            resizeMode="cover"
          />
        )}
      </View>
    </ScrollView>
  );
}
