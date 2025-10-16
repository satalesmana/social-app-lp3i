
import { 
  View, 
  Text, 
  Image, 
  FlatList, 
  ActivityIndicator, 
  Modal, 
  Pressable,
  TouchableOpacity,
  useWindowDimensions
} from "react-native";
import { Feather } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { supabaseDb } from "../../lib/supabase";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "../../global.css";
import { CreatePostModal } from "../../components/postmodal"; 

dayjs.extend(relativeTime);

// ... (Your type definitions and PostItem component remain the same)
type Profile = {
  username: string;
  avatar_url: string;
};

type Post = {
  id: number;
  content: string;
  created_at: string;
  image_url: string | null;
  user_id: string;
};

type PostWithProfile = Post & {
  profile?: Profile | null;
};

const PostItem = ({
  post,
  onImagePress,
}: {
  post: PostWithProfile;
  onImagePress?: (url: string) => void;
}) => (
  <View className="border-b border-gray-200 p-4 flex-row">
    <Image
      source={{
        uri: post.profile?.avatar_url || "https://i.pravatar.cc/150?img=3",
      }}
      className="w-12 h-12 rounded-full mr-4"
    />
    <View className="flex-1">
      <View className="flex-row items-center mb-1 flex-wrap">
        <Text className="font-bold">{post.profile?.username || "Anonymous"}</Text>
        <Text className="text-gray-500 ml-2">
          · {dayjs(post.created_at).fromNow()}
        </Text>
      </View>

      {post.content && (
        <Text className="mb-2 text-base leading-5">{post.content}</Text>
      )}

      {post.image_url && (
        <Pressable onPress={() => post.image_url && onImagePress?.(post.image_url)}>
          <Image
            source={{ uri: post.image_url }}
            className="w-full h-72 rounded-2xl my-2"
            resizeMode="cover"
          />
        </Pressable>
      )}

      <View className="flex-row justify-between mt-3 text-gray-500 pr-10">
        <Feather name="message-circle" size={20} color="gray" />
        <Feather name="repeat" size={20} color="gray" />
        <Feather name="heart" size={20} color="gray" />
        <Feather name="share" size={20} color="gray" />
      </View>
    </View>
  </View>
);


export default function HomeScreen() {
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageVisible, setIsImageVisible] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  // ++ ADDED: State for the create post modal
  const [isModalVisible, setModalVisible] = useState(false);

  // ... (Your useEffect hooks for fetching and subscribing to posts remain the same)
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data: postsData, error: postsError } = await supabaseDb
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (postsError) {
          console.error("Error fetching posts:", postsError);
          setLoading(false);
          return;
        }

        if (!postsData || postsData.length === 0) {
          setPosts([]);
          setLoading(false);
          return;
        }

        const userIds = [...new Set(postsData.map((post) => post.user_id))];

        const { data: profilesData, error: profilesError } = await supabaseDb
          .from("profiles")
          .select("*")
          .in("id", userIds);

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          setPosts(postsData.map((post) => ({ ...post, profile: null })));
          setLoading(false);
          return;
        }

        const postsWithProfiles = postsData.map((post) => {
          const profile = profilesData?.find((p) => p.id === post.user_id);
          return {
            ...post,
            profile: profile
              ? {
                  username:
                    profile.name || profile.full_name || "Anonymous",
                  avatar_url:
                    profile.avatar_url || "https://i.pravatar.cc/150?img=3",
                }
              : null,
          };
        });

        setPosts(postsWithProfiles);
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const channel = supabaseDb
      .channel("public:posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        async (payload) => {
          try {
            const newPost = payload.new as Post;

            const { data: profileData } = await supabaseDb
              .from("profiles")
              .select("*")
              .eq("id", newPost.user_id)
              .single();

            const postWithProfile = {
              ...newPost,
              profile: profileData
                ? {
                    username:
                      profileData.username ||
                      profileData.full_name ||
                      profileData.name ||
                      "Anonymous",
                    avatar_url:
                      profileData.avatar_url ||
                      "https://i.pravatar.cc/150?img=3",
                  }
                : null,
            };

            setPosts((currentPosts) => [postWithProfile, ...currentPosts]);
          } catch (error) {
            console.error("Error handling new post:", error);
          }
        }
      )
      .subscribe();

    return () => {
      supabaseDb.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return <ActivityIndicator className="mt-10" size="large" />;
  }

  return (
    // You can use a React Fragment <> or keep the View
    <View className="flex-1 bg-white">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostItem
            post={item}
            onImagePress={(url) => {
              setSelectedImage(url);
              setIsImageVisible(true);
            }}
          />
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center mt-20">
            <Text className="text-gray-500">
              No posts yet. Be the first to post!
            </Text>
          </View>
        )}
      />
      
      {/* ... (Your Fullscreen Image Modal remains the same) */}
      <Modal
        visible={isImageVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsImageVisible(false)}
      >
        <View className="flex-1 bg-black items-center justify-center">
          <Pressable
            onPress={() => setIsImageVisible(false)}
            className="absolute top-12 right-6 bg-black/60 p-2 rounded-full z-10"
          >
            <Feather name="x" size={26} color="white" />
          </Pressable>

          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              className="w-full h-full"
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      { !isDesktop && (
        <>
          {/* Floating Action Button */}
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="absolute bottom-[20px] right-5 bg-sky-500 w-14 h-14 rounded-full justify-center items-center shadow-lg z-10"
          >
            <Feather name="feather" size={28} color="white" />
          </TouchableOpacity>
          
          {/* Create Post Modal */}
          <CreatePostModal 
            visible={isModalVisible}
            onClose={() => setModalVisible(false)}
          />
        </>
      )}

    </View>
  );
}