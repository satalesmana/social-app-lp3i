import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, ActivityIndicator, RefreshControl } from "react-native";
import { supabase } from "../../lib/supabase";

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fungsi ambil data postingan
  const fetchPosts = async () => {
    if (!refreshing) setLoading(true);

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
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPosts();

    // 🔥 Realtime listener untuk update otomatis
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
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="blue" />
        <Text>Memuat postingan...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id.toString()}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchPosts} />
      }
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View
          style={{
            marginBottom: 20,
            backgroundColor: "white",
            padding: 16,
            borderRadius: 12,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 3 },
            shadowRadius: 5,
            elevation: 3,
          }}
        >
          {/* Email user */}
          <Text style={{ fontWeight: "bold", color: "#555", marginBottom: 4 }}>
            {item.email}
          </Text>

          {/* Isi teks postingan */}
          <Text style={{ color: "#333", marginBottom: 10 }}>
            {item.content}
          </Text>

          {/* Gambar jika ada */}
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={{
                width: "100%",
                height: 200,
                borderRadius: 10,
                marginBottom: 8,
              }}
              resizeMode="cover"
            />
          ) : null}

          {/* Waktu posting */}
          <Text style={{ fontSize: 12, color: "#999" }}>
            {new Date(item.created_at).toLocaleString("id-ID")}
          </Text>
        </View>
      )}
    />
  );
}
