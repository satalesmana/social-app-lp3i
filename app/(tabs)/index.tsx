// app/(tabs)/index.tsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  RefreshControl,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import "../../global.css";
import { supabase } from "../../lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";
import { useFocusEffect } from "expo-router";

/* ============ helpers: waktu relatif + angka singkat + dummy seeded ============ */
function fmtRelative(sec: number) {
  if (sec < 60) return `${Math.max(1, Math.floor(sec))}s`;
  const m = Math.floor(sec / 60);
  if (sec < 3600) return `${m}m`;
  const h = Math.floor(sec / 3600);
  if (sec < 86400) return `${h}h`;
  return `${Math.floor(sec / 86400)}d`;
}
function useRelativeTime(iso: string) {
  const [label, setLabel] = useState(() =>
    fmtRelative((Date.now() - new Date(iso).getTime()) / 1000)
  );
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const tick = () => {
      const sec = Math.max(
        1,
        Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
      );
      setLabel(fmtRelative(sec));
      let next = 1000;
      if (sec >= 60 && sec < 3600) next = (60 - (sec % 60)) * 1000;
      else if (sec >= 3600 && sec < 86400) next = (3600 - (sec % 3600)) * 1000;
      else if (sec >= 86400) next = (86400 - (sec % 86400)) * 1000;
      t.current = setTimeout(tick, next);
    };
    tick();
    return () => t.current && clearTimeout(t.current);
  }, [iso]);
  return label;
}
function shortNum(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return String(v);
}
// seed supaya angka dummy konsisten per post.id
function xmur3(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}
function seeded(id: string, min: number, max: number) {
  const r = xmur3(id)() % 10000;
  const p = r / 10000;
  return Math.floor(min + p * (max - min + 1));
}

/* ============ types ============ */
interface Post {
  id: string;
  user_id: string | null;
  email: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

/* ============ UI kecil: PostImage & ActionBar ============ */
function PostImage({ uri }: { uri: string }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <View
      style={{
        marginTop: 8,
        // ikut lebar kolom konten → aman di mobile (tidak kepotong)
        alignSelf: "stretch",
        width: "100%",
        // batasi hanya di desktop
        maxWidth: isDesktop ? 520 : undefined,
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <Image
        source={{ uri }}
        style={{ width: "100%", aspectRatio: 16 / 9 }}
        resizeMode="cover"
      />
    </View>
  );
}

function ActionBar({ seedId }: { seedId: string }) {
  const [liked, setLiked] = useState(false);
  const [retweeted, setRetweeted] = useState(false);
  const [counts, setCounts] = useState(() => ({
    comments: seeded(seedId + ":c", 0, 120),
    retweets: seeded(seedId + ":r", 0, 350),
    likes: seeded(seedId + ":l", 3, 6200),
    shares: seeded(seedId + ":s", 0, 80),
  }));
  const gray = "#6b7280";

  return (
    <View className="mt-2 flex-row justify-between pr-1">
      {/* Comment */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
      >
        <Ionicons name="chatbubble-outline" size={18} color={gray} />
        <Text style={{ color: gray, fontSize: 13 }}>{shortNum(counts.comments)}</Text>
      </TouchableOpacity>

      {/* Retweet */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          const next = !retweeted;
          setRetweeted(next);
          setCounts((c) => ({
            ...c,
            retweets: Math.max(0, c.retweets + (next ? 1 : -1)),
          }));
        }}
        style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
      >
        <MCI
          name="repeat-variant"
          size={20}
          color={retweeted ? "#16a34a" : gray}
        />
        <Text
          style={{
            color: retweeted ? "#16a34a" : gray,
            fontSize: 13,
            fontWeight: retweeted ? "600" : "400",
          }}
        >
          {shortNum(counts.retweets)}
        </Text>
      </TouchableOpacity>

      {/* Like */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          const next = !liked;
          setLiked(next);
          setCounts((c) => ({
            ...c,
            likes: Math.max(0, c.likes + (next ? 1 : -1)),
          }));
        }}
        style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
      >
        <MCI
          name={liked ? "heart" : "heart-outline"}
          size={20}
          color={liked ? "#ef4444" : gray}
        />
        <Text
          style={{
            color: liked ? "#ef4444" : gray,
            fontSize: 13,
            fontWeight: liked ? "600" : "400",
          }}
        >
          {shortNum(counts.likes)}
        </Text>
      </TouchableOpacity>

      {/* Share */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Ionicons name="share-outline" size={19} color={gray} />
        <Text style={{ color: gray, fontSize: 13 }}>{shortNum(counts.shares)}</Text>
      </View>
    </View>
  );
}

function PostCard({ post }: { post: Post }) {
  const rel = useRelativeTime(post.created_at);
  return (
    <View className="border-b border-gray-200 px-4 py-3">
      <View className="flex-row items-start gap-3">
        <Image
          source={{ uri: "https://randomuser.me/api/portraits/women/44.jpg" }}
          className="h-10 w-10 rounded-full"
        />
        <View className="flex-1">
          {/* header */}
          <View className="flex-row items-center gap-2">
            <Text className="font-semibold">{post.email}</Text>
            <Text className="text-gray-500">·</Text>
            <Text className="text-gray-500">{rel}</Text>
          </View>

          {/* text */}
          {!!post.content && <Text className="mt-1 text-[15px]">{post.content}</Text>}

          {/* image */}
          {post.image_url ? <PostImage uri={post.image_url} /> : null}

          {/* action bar */}
          <ActionBar seedId={post.id} />
        </View>
      </View>
    </View>
  );
}

/* ============ Main Screen ============ */
export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async () => {
    const {
      data,
      error,
    }: { data: Post[] | null; error: PostgrestError | null } = await supabase
      .from("postingan")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error);
    } else if (data) {
      setPosts(data);
    }
  }, []);

  // refetch saat tab fokus
  useFocusEffect(
    React.useCallback(() => {
      fetchPosts();
    }, [fetchPosts])
  );

  // realtime
  useEffect(() => {
    const upsertPost = (p: Post) => {
      setPosts((prev) => {
        const exists = prev.find((x) => x.id === p.id);
        if (exists) return prev.map((x) => (x.id === p.id ? p : x));
        return [p, ...prev].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
    };
    const removePost = (id: string) =>
      setPosts((prev) => prev.filter((x) => x.id !== id));

    const channel = supabase
      .channel("postingan-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "postingan" },
        (payload) => upsertPost(payload.new as Post)
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "postingan" },
        (payload) => upsertPost(payload.new as Post)
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "postingan" },
        (payload) => removePost((payload.old as Post).id)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // initial load
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }, [fetchPosts]);

  return (
    <ScrollView
      className="bg-white"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}

      {posts.length === 0 && (
        <View className="px-6 py-10">
          <Text className="text-center text-gray-500">
            Belum ada postingan. Klik Tweet untuk menulis.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
