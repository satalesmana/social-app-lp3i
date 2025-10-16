// app/(tabs)/index.tsx

import { View, Text, Image, FlatList, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import React, { useState, useEffect } from 'react';
import { supabaseDb } from '../../lib/supabase'; // <-- Menggunakan klien database kedua (supabaseDb)
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "../../global.css";

dayjs.extend(relativeTime);

// Tipe data untuk Postingan, harus cocok dengan struktur data yang kita ambil
type Post = {
  id: number;
  content: string;
  created_at: string;
  image_url: string | null;
  // Kita asumsikan ada tabel 'profiles' yang terhubung
  profiles: {
    username: string;
    avatar_url: string;
  } | null;
};

// Komponen untuk merender satu item post
const PostItem = ({ post }: { post: Post }) => (
  <View className="border-b border-gray-200 p-4 flex-row">
    <Image
      source={{ uri: post.profiles?.avatar_url || "https://i.pravatar.cc/150?img=3" }}
      className="w-12 h-12 rounded-full mr-4"
    />
    <View className="flex-1">
      <View className="flex-row items-center mb-1 flex-wrap">
        <Text className="font-bold">{post.profiles?.username || 'Anonymous'}</Text>
        <Text className="text-gray-500 ml-2">· {dayjs(post.created_at).fromNow()}</Text>
      </View>
      
      {post.content && <Text className="mb-2 text-base leading-5">{post.content}</Text>}
      
      {post.image_url && (
        <Image 
          source={{ uri: post.image_url }} 
          className="w-full h-72 rounded-2xl my-2" 
          resizeMode="cover" 
        />
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Mengambil data awal saat komponen dimuat
  useEffect(() => {
    const fetchPosts = async () => {
      // Mengambil data dari 'posts' dan menggabungkannya dengan 'profiles'
      const { data, error } = await supabaseDb
        .from('posts')
        .select(`*`) 
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching posts:", error);
      } else if (data) {
        setPosts(data as Post[]);
      }
      setLoading(false);
    };
    fetchPosts();
  }, []);

  // 2. Mendengarkan postingan baru secara real-time
  useEffect(() => {
    const channel = supabaseDb
      .channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, 
        async (payload) => {
          // Ketika ada post baru, ambil data lengkapnya (termasuk profil)
          const { data: newPost } = await supabaseDb
            .from('posts')
            .select(`*`)
            .eq('id', payload.new.id)
            .single();
          
          if (newPost) {
            // Tambahkan post baru ke bagian atas daftar
            setPosts(currentPosts => [newPost as Post, ...currentPosts]);
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
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <PostItem post={item} />}
      ListEmptyComponent={() => (
        <View className="flex-1 justify-center items-center mt-20">
          <Text className="text-gray-500">No posts yet. Be the first to post!</Text>
        </View>
      )}
    />
  );
}