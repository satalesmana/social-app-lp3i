import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import "../../global.css";
import { useState, useEffect } from "react";
import TweetModal from "../../components/TweetModal";
import { supabase } from '../../lib/supabase';





export default function HomeScreen(){
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [postList, setPostList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch posts from Supabase
    const fetchPosts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('postingan')
            .select('*')
            .order('created_at', { ascending: false });
        if (!error && data) {
            setPostList(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPosts();
        // Listen for new post event (optional)
        const handler = () => fetchPosts();
        window.addEventListener('post:created', handler);
        return () => window.removeEventListener('post:created', handler);
    }, []);

    const handlePost = async (content: string, imageUri?: string | null) => {
        // Posting handled in TweetModal, just refresh
        setIsModalVisible(false);
        fetchPosts();
    };

    return(
        <View className="flex-1">
            <ScrollView className="flex-1">
                {loading ? (
                  <Text className="text-center mt-8">Loading...</Text>
                ) : postList.length === 0 ? (
                  <Text className="text-center mt-8">Belum ada postingan.</Text>
                ) : postList.map((post) => (
                  <View key={post.id || post.created_at} className="border-b border-gray-200 p-4">
                    {/* Header */}
                    <View className="flex-row items-center mb-2">
                      <Image
                        source={{ uri: post.avatar_url || "https://randomuser.me/api/portraits/women/44.jpg" }}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <View>
                        <Text className="font-bold">{post.email || 'User'}</Text>
                        <Text className="text-gray-400 text-xs">{new Date(post.created_at).toLocaleString()}</Text>
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
                  </View>
                ))}
            </ScrollView>
        </View>
    );
}