// app/detail.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

type Topic = {
  id: string;
  query: string;
  description: string | null;
  content: string | null;
  cover_url: string | null;
  slug: string | null;
};

type Post = {
  id: string;
  email: string | null;
  content: string | null;
  image_url: string | null;
  created_at: string;
};

export default function DetailPage() {
  const { slug, title } = useLocalSearchParams<{ slug?: string; title?: string }>();
  const router = useRouter();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [loadingTopic, setLoadingTopic] = useState(true);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const headerTitle = useMemo(
    () => topic?.query ?? (Array.isArray(title) ? title?.[0] : title) ?? "Topik",
    [topic, title]
  );

  // --- Ambil detail topik (cukup buat dapat id-nya)
  const fetchTopic = useCallback(async () => {
    setLoadingTopic(true);
    try {
      let res;
      if (slug) {
        res = await supabase
          .from("topics")
          .select("id, query, description, content, cover_url, slug")
          .eq("slug", Array.isArray(slug) ? slug[0] : slug)
          .maybeSingle();
      } else if (title) {
        res = await supabase
          .from("topics")
          .select("id, query, description, content, cover_url, slug")
          .eq("query", Array.isArray(title) ? title[0] : title)
          .maybeSingle();
      } else {
        res = { data: null };
      }
      setTopic((res as any)?.data ?? null);
    } finally {
      setLoadingTopic(false);
    }
  }, [slug, title]);

  // --- Ambil posting terkait
  const fetchPosts = useCallback(async () => {
    if (!topic?.id) return;
    setLoadingPosts(true);
    try {
      const { data, error } = await supabase
        .from("postingan")
        .select("id, email, content, image_url, created_at")
        .eq("topic_id", topic.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Gagal ambil posting:", error.message);
        setPosts([]);
      } else {
        setPosts(data || []);
      }
    } finally {
      setLoadingPosts(false);
    }
  }, [topic?.id]);

  useEffect(() => {
    fetchTopic();
  }, [fetchTopic]);

  useEffect(() => {
    if (topic) fetchPosts();
  }, [topic, fetchPosts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTopic();
    await fetchPosts();
    setRefreshing(false);
  };

  if (loadingTopic) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Memuat…</Text>
        </View>
        <ActivityIndicator style={{ marginTop: 24 }} />
      </SafeAreaView>
    );
  }

  if (!topic) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Topik tidak ditemukan</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={posts}
        extraData={[posts, topic]}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View>
            {/* HEADER TOPIK minimalis (tanpa deskripsi/tag besar) */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {headerTitle}
              </Text>
            </View>

            {/* (opsional) cover - kalau mau benar-benar sama dengan kiri, boleh dihilangkan */}
            {topic.cover_url ? (
              <Image source={{ uri: topic.cover_url }} style={styles.cover} resizeMode="cover" />
            ) : null}

            {/* Tidak menampilkan topic.description / topic.content agar kartu mirip feed kiri */}
          </View>
        }
        renderItem={({ item }) => {
          const timeStr = new Date(item.created_at).toLocaleString();

          return (
            <View style={styles.postCard}>
              {/* Header akun: email + waktu */}
              <View style={styles.tweetHeader}>
                {/* samakan avatar dengan Home */}
                <Image
                  source={{ uri: "https://randomuser.me/api/portraits/women/44.jpg" }}
                  style={styles.avatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.emailText} numberOfLines={1}>
                    {item.email ?? "pengguna@example.com"}
                  </Text>
                  <Text style={styles.time}>{timeStr}</Text>
                </View>
              </View>

              {/* CAPTION di atas foto */}
              {!!item.content && <Text style={styles.postCaption}>{item.content}</Text>}

              {/* FOTO */}
              {!!item.image_url && (
                <Image source={{ uri: item.image_url }} style={styles.tweetImage} resizeMode="cover" />
              )}

              {/* Action bar (opsional) */}
              <View style={styles.actionBar}>
                <View style={styles.actionBtn}>
                  <Ionicons name="chatbubble-outline" size={18} color="#6b7280" />
                  <Text style={styles.actionText}>0</Text>
                </View>
                <View style={styles.actionBtn}>
                  <Ionicons name="heart-outline" size={18} color="#6b7280" />
                  <Text style={styles.actionText}>0</Text>
                </View>
                <View style={styles.actionBtn}>
                  <Ionicons name="share-outline" size={18} color="#6b7280" />
                </View>
              </View>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={
          <Text style={styles.empty}>Belum ada posting terkait.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", marginLeft: 8 },

  cover: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: "#eee",
  },

  // Kartu posting
  postCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },

  // Header item
  tweetHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10, backgroundColor: "#f3f4f6" },
  emailText: { fontWeight: "700", color: "#111827", fontSize: 15 },
  time: { fontSize: 12, color: "#6b7280" },

  // Caption post (di atas foto)
  postCaption: {
    fontSize: 14,
    color: "#111827",
    marginTop: 4,
    marginBottom: 8, // jarak ke foto
  },

  // Foto
  tweetImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },

  // Action bar
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingRight: 40,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionText: { fontSize: 12, color: "#6b7280", marginLeft: 6 },

  empty: { textAlign: "center", marginTop: 8, color: "#9ca3af" },
});
