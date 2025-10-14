import { View, Text, Image, useWindowDimensions, TouchableOpacity, FlatList } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import "../../global.css";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import CreatePost from "./create-post";
import { router, useLocalSearchParams } from "expo-router";

interface Post {
  id: number;
  user_id: string;
  email: string;
  content: string;  // Note: changed from contents to content based on your DB
  image_url: string;
  created_at: string;
}

const PostCard = ({ post }: { post: Post }) => (
  <View className="border-b border-gray-200 p-4">
    {/* Header */}
    <View className="flex-row items-center mb-2">
      <Image
        source={{ uri: "https://api.dicebear.com/7.x/avataaars/png?seed=" + post.email }}
        className="w-10 h-10 rounded-full mr-3"
      />
      <View>
        <Text className="font-bold">{post.email.split('@')[0]}</Text>
        <Text className="text-gray-500">
          {new Date(post.created_at).toLocaleDateString()}
        </Text>
      </View>
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
      <TouchableOpacity className="flex-row items-center space-x-1">
        <Ionicons name="chatbubble-outline" size={20} color="gray" />
        <Text className="text-gray-500 ml-1">0</Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-row items-center space-x-1">
        <Ionicons name="repeat" size={20} color="gray" />
        <Text className="text-gray-500 ml-1">0</Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-row items-center space-x-1">
        <Ionicons name="heart-outline" size={20} color="gray" />
        <Text className="text-gray-500 ml-1">0</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Feather name="share" size={20} color="gray" />
      </TouchableOpacity>
    </View>
  </View>
);

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showModal, setShowModal] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('postingan')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostCreated = async () => {
    await fetchPosts(); // Refresh posts after creation
    setShowModal(false); // Close modal
  };

  // Fixed floating button for mobile
  const FloatingButton = () => (
    <TouchableOpacity
      className="absolute bottom-6 right-4 bg-sky-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
      onPress={() => setShowModal(true)}
      style={{
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      }}
    >
      <Feather name="feather" size={24} color="white" />
    </TouchableOpacity>
  );

  // Untuk desktop, layout utama sudah diatur di _layout.tsx
  // Komponen ini hanya perlu me-render daftar post.
  if (isDesktop) {
    return (
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostCard post={item} />}
        keyExtractor={(item) => item.id.toString()}
      />
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostCard post={item} />}
        keyExtractor={(item) => item.id.toString()}
      />
      <FloatingButton />
      <CreatePost
        visible={showModal}
        onClose={() => setShowModal(false)}
        onPostCreated={handlePostCreated}
      />
    </View>
  );
}