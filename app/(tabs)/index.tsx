import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import "../../global.css";
import { supabase, uploadImage } from "../../lib/supabase";
import React, { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import dayjs from "dayjs";
import { useTweetModal } from "../../context/TweetModalContext";
import { SafeAreaView } from "react-native-safe-area-context";
import TweetModal from "../../components/TweetModal";

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
  const [session, setSession] = useState<Session | null>(null);
  const [post, setPost] = useState<Post[]>([]);
  const { openModal, closeModal } = useTweetModal();
  const [showTweetButton, setShowTweetButton] = useState(true);

  const handleOpenModal = () => {
    setShowTweetButton(false);
    openModal();
  };

  const handleCloseModal = () => {
    setShowTweetButton(true);
    closeModal();
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    fetchPosts();
    setupRealtimeChannels();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("postingan")
      .select(
        `
                *
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

    return () => {
      supabase.removeChannel(postChannel);
    };
  };
  const renderPost = ({ item }: { item: Post }) => (
    <View className="border-b border-gray-200 p-4">
      <View className="flex-row ">
        <Image
          source={{ uri: "https://i.pravatar.cc/100" }}
          className="w-12 h-12 md:w-10 md:h-10 rounded-full mr-3  md:mr-3"
        />
        <View>
          <Text className="font-bold text-lg md:text-sm">
            @{(item.email || "unknown").split("@")[0]}
          </Text>
          <Text className="text-[12px] md:text-[12px] text-neutral-500 md:mt-1">
            {dayjs(item.created_at).format("h:mm A")}
          </Text>
                    
        </View>
      </View>

      <View className="px-4 md:px-0">
        <View className="flex-col gap-4 px-1 pl-10">
          <Text className="mb-2 text-md md:mt-2 md:text-sm mt-2">
            {item.content}
          </Text>

          {item.image_url && (
            <Image
              source={{ uri: item.image_url }}
              className="w-full h-48 rounded-xl mb-2 "
              resizeMode="cover"
            />
          )}
        </View>

        <View className="flex-row justify-between mt-2 pl-10">
          <View className="flex-row items-center space-x-1">
            <Ionicons name="chatbubble-outline" size={20} color="gray" />
            <Text className="text-gray-500">komen</Text>
          </View>

          <View className="flex-row items-center space-x-1">
            <Ionicons name="repeat" size={20} color="gray" />
            <Text className="text-gray-500">share</Text>
          </View>

          <View className="flex-row items-center space-x-1">
            <Pressable>
              <Ionicons name="heart-outline" size={20} color="gray" />
            </Pressable>
            <Text className="text-gray-500">likes</Text>
          </View>

          <Feather name="share" size={20} color="gray" />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1">
      <FlatList
        data={post}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
      />

      {Platform.OS === "android" && showTweetButton && (
        <TouchableOpacity
          onPress={handleOpenModal}
          className="bg-sky-500 w-14 h-14 rounded-full absolute bottom-10 right-5 items-center justify-center shadow-lg"
        >
          <Feather name="feather" size={24} color="white" />
        </TouchableOpacity>
      )}

      <TweetModal handleCloseModal={handleCloseModal} />
    </SafeAreaView>
  );
}
