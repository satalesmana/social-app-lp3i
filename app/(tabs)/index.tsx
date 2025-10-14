import { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, Pressable, RefreshControl, Modal, TextInput, Keyboard, SafeAreaView } from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from '../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import "../../global.css"

dayjs.extend(relativeTime);

// Tipe data untuk Post
type Post = {
  id: number;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

// Fungsi BARU untuk format waktu
const formatTimeAgo = (timestamp: string) => {
  const now = dayjs();
  const postTime = dayjs(timestamp);

  const diffSeconds = now.diff(postTime, 'second');
  if (diffSeconds < 60) return `${diffSeconds}s`;

  const diffMinutes = now.diff(postTime, 'minute');
  if (diffMinutes < 60) return `${diffMinutes}m`;

  const diffHours = now.diff(postTime, 'hour');
  if (diffHours < 24) return `${diffHours}h`;

  const diffDays = now.diff(postTime, 'day');
  if (diffDays < 7) return `${diffDays}d`;
  
  const diffWeeks = now.diff(postTime, 'week');
  if (diffWeeks < 4) return `${diffWeeks}w`;

  const diffMonths = now.diff(postTime, 'month');
  if (diffMonths < 12) return `${diffMonths}month`;

  return `${now.diff(postTime, 'year')}y`;
};

// ================================================================
// KOMPONEN UNTUK MEMBUAT POST
// ================================================================
const CreatePostSheet = ({ visible, onClose }: { visible: boolean, onClose: () => void }) => {
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_CHARACTERS = 300;

  useEffect(() => {
    if (visible) {
      const fetchUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          setUser(profile);
        }
      };
      fetchUser();
    } else {
        setContent('');
        setImageUri(null);
        setIsSubmitting(false);
    }
  }, [visible]);

  const uploadImage = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();
    const fileName = `${Date.now()}.jpg`;
    const { data, error } = await supabase.storage.from('posts').upload(fileName, arrayBuffer, { contentType: 'image/jpeg', upsert: false });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('posts').getPublicUrl(fileName);
    return publicUrl;
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!content && !imageUri) return;
    setIsSubmitting(true);
    try {
      let imageUrl: string | undefined = undefined;
      if (imageUri) {
        imageUrl = await uploadImage(imageUri);
      }
      await supabase.from('posts').insert([{ content, user_id: user.id, image_url: imageUrl }]);
      onClose();
    } catch (error: any) {
      console.error('Error posting:', error.message);
    } finally {
      setIsSubmitting(false);
      Keyboard.dismiss();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <Pressable onPress={onClose} className="flex-1 justify-end bg-black/50">
        <Pressable onPress={(e) => e.stopPropagation()} className="bg-white rounded-t-2xl h-[55%]">
          {/* 1. TINGGI DIUBAH DI SINI (h-[60%]) */}
          <SafeAreaView className="p-4 flex-1">
            <View>
              <View className="w-12 h-1.5 bg-gray-300 rounded-full self-center mb-4" />
              <View className="flex-row items-center pb-4 border-b border-gray-200">
                <Pressable onPress={pickImage}><Feather name="image" size={26} color="rgb(29, 155, 240)" /></Pressable>
                <Pressable className="ml-4 border border-blue-400 rounded px-2 py-1">
                  <Text className="text-blue-400 font-bold text-sm">GIF</Text>
                </Pressable>
                <Text className="text-gray-500 ml-auto">{MAX_CHARACTERS - content.length} Character left</Text>
              </View>
            </View>

            <ScrollView className="my-4">
              <View className="flex-row">
                <Image source={{ uri: user?.avatar_url || 'https://avatar.iran.liara.run/public' }} className="w-12 h-12 rounded-full mr-3 bg-gray-200" />
                <TextInput 
                  value={content} 
                  onChangeText={setContent} 
                  placeholder="What's happening?" 
                  className="flex-1 text-lg"
                  multiline 
                  maxLength={MAX_CHARACTERS} 
                  autoFocus
                  textAlignVertical="top"
                />
              </View>
              {imageUri && (
                <View className="mt-4 relative">
                  <Image source={{ uri: imageUri }} className="w-full h-72 rounded-xl" />
                  <Pressable onPress={() => setImageUri(null)} className="absolute top-2 right-2 bg-black/60 rounded-full p-1"><Feather name="x" size={20} color="white" /></Pressable>
                </View>
              )}
            </ScrollView>

            <View className="mt-auto">
              <Pressable onPress={handlePost} disabled={(content.length === 0 && !imageUri) || isSubmitting} className={`rounded-full py-3 ${(content.length > 0 || imageUri) && !isSubmitting ? 'bg-blue-500' : 'bg-blue-300'}`}>
                {isSubmitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base text-center">Post</Text>}
              </Pressable>
              
              <Pressable onPress={onClose} className="rounded-full py-3 mt-2 border border-blue-500">
                {/* 2. WARNA TEKS CANCEL DIUBAH DI SINI */}
                <Text className="text-gray-500 font-bold text-base text-center">Cancel</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// ================================================================
// KOMPONEN UTAMA: HomeScreen
// ================================================================
export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id, content, image_url, created_at,
          profiles ( full_name, username, avatar_url )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setPosts(data);

    } catch (err: any) {
      setError(err.message);
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    const channel = supabase
      .channel('public:posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
          console.log('Post baru diterima!', payload);
          fetchPosts(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading && posts.length === 0) {
    return <ActivityIndicator size="large" className="flex-1 justify-center items-center" />;
  }

  if (error) {
    return <Text className="flex-1 justify-center items-center text-red-500">Error: {error}</Text>;
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchPosts} />
        }
      >
        {!loading && posts.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500 text-lg">Post is Empty</Text>
          </View>
        ) : (
          posts.map((post) => (
            <View key={post.id} className="flex-row p-3 border-b border-gray-200">
              <View className="mr-3">
                <Image
                  source={{ uri: post.profiles?.avatar_url || 'https://avatar.iran.liara.run/public' }}
                  className="w-12 h-12 rounded-full bg-gray-200"
                />
              </View>
              <View className="flex-1">
                <View className="flex-row items-baseline">
                  <Text className="font-bold text-base mr-2">{post.profiles?.full_name || 'User'}</Text>
                  <Text className="text-gray-500 text-sm">@{post.profiles?.username || 'username'} · {formatTimeAgo(post.created_at)}</Text>
                </View>
                <Text className="mt-1 mb-2 text-base leading-5">{post.content}</Text>
                {post.image_url && (
                  <Image
                    source={{ uri: post.image_url }}
                    className="w-full h-72 rounded-xl my-1 bg-gray-200"
                    resizeMode="cover"
                  />
                )}
                <View className="flex-row justify-between mt-3">
                  <View className="flex-row items-center space-x-1">
                    <Ionicons name="chatbubble-outline" size={20} color="gray" />
                    <Text className="text-gray-500 text-sm">61</Text>
                  </View>
                  <View className="flex-row items-center space-x-1">
                    <Ionicons name="repeat" size={20} color="gray" />
                    <Text className="text-gray-500 text-sm">12</Text>
                  </View>
                  <View className="flex-row items-center space-x-1">
                    <Ionicons name="heart-outline" size={20} color="gray" />
                    <Text className="text-gray-500 text-sm">6.2K</Text>
                  </View>
                  <Ionicons name="share-outline" size={20} color="gray" />
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Pressable
        onPress={() => setModalVisible(true)}
        className="bg-blue-500 rounded-full w-14 h-14 justify-center items-center absolute bottom-5 right-5 shadow-lg md:hidden"
      >
        <Feather name="edit-2" size={28} color="white" />
      </Pressable>
      
      <CreatePostSheet visible={isModalVisible} onClose={() => setModalVisible(false)} />
    </View>
  )
}