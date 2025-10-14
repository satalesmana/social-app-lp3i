// app/(tabs)/index.tsx

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Platform,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { FontAwesome, MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';

import { supabase } from '../../lib/supabase';
import { Post, Profile } from '../../lib/types';
import '../../global.css';

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        const validPosts = data.filter(post => post.profiles);
        setPosts(validPosts as any);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (data) setProfile(data);
      }
    };
    
    fetchProfile();
    fetchPosts();
    
    const channel = supabase
      .channel('realtime posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading && posts.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const defaultAvatar = `https://api.dicebear.com/8.x/pixel-art/png?seed=${profile?.username}`;

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS !== 'web' && (
        <View className="flex-row justify-between items-center p-4 border-b border-gray-200 mt-4">
          <Image
            source={{ uri: profile?.avatar_url || defaultAvatar }}
            className="w-8 h-8 rounded-full bg-gray-300"
          />
          <FontAwesome name="twitter" size={28} color="#1DA1F2" />
          <MaterialCommunityIcons name="creation" size={28} color="#1DA1F2" />
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchPosts} />
        }
      >
        {posts.map((post) => (
           <View key={post.id} className="border-b border-gray-200 p-4">
            <View className="flex-row items-center mb-2">
              <Image
                source={{ 
                  uri: post.profiles?.avatar_url || `https://api.dicebear.com/8.x/pixel-art/png?seed=${post.profiles?.username}` 
                }}
                className="w-10 h-10 rounded-full mr-3 bg-gray-200"
              />
              <View>
                <Text className="font-bold">{post.profiles?.full_name || 'Anonymous'}</Text>
                <Text className="text-gray-500">@{post.profiles?.username || 'user'}</Text>
              </View>
            </View>
            
            {post.content && (
              <Text className="mb-2 text-base">{post.content}</Text>
            )}

            {post.image_url && (
              <Image
                source={{ uri: post.image_url }}
                className="w-full h-72 rounded-xl my-2"
                resizeMode="cover"
              />
            )}
            
            <View className="flex-row justify-between mt-2">
              <View className="flex-row items-center space-x-1">
                <Ionicons name="chatbubble-outline" size={20} color="gray" />
                <Text className="text-gray-500">0</Text>
              </View>
              <View className="flex-row items-center space-x-1">
                <Ionicons name="repeat" size={20} color="gray" />
                <Text className="text-gray-500">0</Text>
              </View>
              <View className="flex-row items-center space-x-1">
                <Ionicons name="heart-outline" size={20} color="gray" />
                <Text className="text-gray-500">0</Text>
              </View>
              <Feather name="share" size={20} color="gray" />
            </View>
           </View>
        ))}
      </ScrollView>

      {Platform.OS !== 'web' && (
        <Link href="/new-post" asChild>
          <Pressable style={styles.fab}>
            <MaterialCommunityIcons name="pencil-plus" size={24} color="white" />
          </Pressable>
        </Link>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1DA1F2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});