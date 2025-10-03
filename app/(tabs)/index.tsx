import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, ActivityIndicator } from "react-native";
import { supabase } from "../../lib/supabase";

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("postingan")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetch posts:", error);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();

    // realtime listener 🔥
    const channel = supabase
      .channel("postingan-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "postingan" },
        (payload) => {
          console.log("Realtime change:", payload);
          fetchPosts(); // refresh otomatis
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="blue" />
        <Text>Memuat postingan...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View className="mb-5 bg-white p-4 rounded-lg shadow">
          {/* Email user */}
          <Text className="font-semibold text-gray-700 mb-1">{item.email}</Text>

          {/* Isi konten */}
          <Text className="text-gray-800 mb-2">{item.content}</Text>

          {/* Jika ada gambar */}
          {item.image_url && (
            <Image
              source={{ uri: item.image_url }}
              style={{ width: "100%", height: 200, borderRadius: 10 }}
              resizeMode="cover"
            />
          )}

          {/* Waktu */}
          <Text className="text-xs text-gray-400 mt-2">
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
      )}
    />
  );
}
  