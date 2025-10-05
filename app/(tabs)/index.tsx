import {
  View,
  Text,
  Image,
  Pressable,
  TextInput,
  FlatList,
} from "react-native";
import { Ionicons, Entypo, Feather } from "@expo/vector-icons";
import "../../global.css";
import * as ImagePicker from "expo-image-picker";
import { supabase, uploadImage } from "../../lib/supabase";
import React, { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import dayjs from 'dayjs';

type Post = {
  id: number;
  created_at: string;
  user_id: string;
  email: string;
  content: string;
  image_url: string;
  likes?: number;
};

export default function HomeScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [post, setPost] = useState<Post[]>([]);
  const [userLikes, setUserLikes] = useState<number[]>([]);

  // Ambil session dan data awal
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserLikes(session.user.id);
    });

    fetchPosts();
    setupRealtimeChannels();
  }, []);

  // Fetch semua post
  const fetchPosts = async () => {
    const { data } = await supabase
      .from("postingan")
      .select(
        `
        *,
        post_likes:post_likes(post_id)
      `
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      const postsWithLikes = data.map((p: any) => ({
        ...p,
        likes: p.post_likes?.length || 0,
      }));
      setPost(postsWithLikes);
    }
  };

  // Fetch likes user untuk icon merah
  const fetchUserLikes = async (userId: string) => {
    const { data } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", userId);

    if (data) setUserLikes(data.map((like) => like.post_id));
  };

  // Kirim post baru
  const sendPost = async () => {
    if (!input.trim()) return;

    let imageUrl = "";
    if (image && imageName) {
      imageUrl = await uploadImage(image, imageName);
    }

    const { error } = await supabase.from("postingan").insert({
      user_id: session?.user.id,
      content: input,
      email: session?.user.email,
      image_url: imageUrl,
    });

    setInput("");
    setImage(null);
    setImageName(null);

    if (error) console.error("Error sending post:", error);
  };

  // Pick image dari gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].base64 as string);
      setImageName(result.assets[0].fileName as string);
    }
  };

  // Toggle like user
  const toggleLike = async (postId: number) => {
    if (!session) return;
    const hasLiked = userLikes.includes(postId);

    if (!hasLiked) {
      const { error } = await supabase
        .from("post_likes")
        .insert({ post_id: postId, user_id: session.user.id });
      if (!error) setUserLikes((prev) => [...prev, postId]);
    } else {
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .match({ post_id: postId, user_id: session.user.id });
      if (!error) setUserLikes((prev) => prev.filter((id) => id !== postId));

      setPost((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likes: Math.max((p.likes || 1) - 1, 0) } : p
        )
      );
    }
  };

  // Setup realtime listener
  const setupRealtimeChannels = () => {
    const postChannel = supabase
      .channel("postingan-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "postingan" },
        (payload) => {
          setPost((prev) => {
            if (payload.eventType === "INSERT")
              return [payload.new as Post, ...prev];
            if (payload.eventType === "UPDATE")
              return prev.map((p) =>
                p.id === payload.new.id ? (payload.new as Post) : p
              );
            if (payload.eventType === "DELETE")
              return prev.filter((p) => p.id !== payload.old.id);
            return prev;
          });
        }
      )
      .subscribe();

    const likesChannel = supabase
      .channel("post-likes-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "post_likes" },
        async (payload) => {
          const postId = payload.new?.post_id || payload.old?.post_id;
          if (!postId) return;

          // Ambil semua likes terbaru untuk post ini
          const { data } = await supabase
            .from("post_likes")
            .select("*")
            .eq("post_id", postId);

          setPost((prev) =>
            prev.map((p) =>
              p.id === postId ? { ...p, likes: data?.length || 0 } : p
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postChannel);
      supabase.removeChannel(likesChannel);
    };
  };

  // Render tiap post
  const renderPost = ({ item }: { item: Post }) => (
    <View className="border-b border-gray-200 p-4">
      <View className="flex-row  mb-2">
        <Image
          source={{ uri: "https://i.pravatar.cc/100" }}
          className="w-10 h-10 rounded-full mr-3"
        />
        <View>
          <Text className="font-bold">@{item.email.split("@")[0]}</Text>
          <Text className="text-[10px] text-neutral-500 mt-1">
            {dayjs(item.created_at).format("h:mm A")}
          </Text>
        </View>
      </View>

      <Text className="mb-2">{item.content}</Text>
      {item.image_url && (
        <Image
          source={{ uri: item.image_url }}
          className="w-full h-48 rounded-xl mb-2"
          resizeMode="cover"
        />
      )}

      <View className="flex-row justify-between mt-2">
        <View className="flex-row items-center space-x-1">
          <Ionicons name="chatbubble-outline" size={20} color="gray" />
          <Text className="text-gray-500">komen</Text>
        </View>

        <View className="flex-row items-center space-x-1">
          <Ionicons name="repeat" size={20} color="gray" />
          <Text className="text-gray-500">share</Text>
        </View>

        <View className="flex-row items-center space-x-1">
          <Pressable onPress={() => toggleLike(item.id)}>
            <Ionicons
              name={userLikes.includes(item.id) ? "heart" : "heart-outline"}
              size={20}
              color={userLikes.includes(item.id) ? "red" : "gray"}
            />
          </Pressable>
          <Text className="text-gray-500">{item.likes || 0}</Text>
        </View>

        <Feather name="share" size={20} color="gray" />
      </View>
    </View>
  );

  return (
    <FlatList
      data={post}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderPost}
      ListHeaderComponent={
        <View className="w-full max-w-xl mx-auto p-4">
          <View className="flex-row gap-3">
            <Image
              source={{ uri: "https://i.pravatar.cc/150?img=5" }}
              className="w-10 h-10 rounded-full border border-gray-300"
            />
            <TextInput
              multiline
              numberOfLines={4}
              placeholder="what's happening..."
              onChangeText={setInput}
              value={input}
              className="flex-1 resize-none bg-transparent border border-gray-200 p-3 focus:outline-none mb-2"
            />
          </View>

          {image && (
            <Image
              source={{ uri: `data:image/jpeg;base64,${image}` }}
              className="w-48 h-48 rounded-xl mb-2 mx-auto"
              resizeMode="cover"
            />
          )}

          <View className="flex-row justify-between items-center border-t border-gray-200 p-3">
            <Pressable onPress={pickImage}>
              <View className="px-3 py-2 rounded-full hover:bg-gray-300 transition">
                <Entypo name="image" size={16} color="gray" />
              </View>
            </Pressable>

            <Pressable
              onPress={sendPost}
              className="bg-blue-500 px-5 py-1 rounded-full hover:bg-blue-600 transition"
            >
              <Text className="text-white font-medium">Post</Text>
            </Pressable>
          </View>
        </View>
      }
    />
  );
}
