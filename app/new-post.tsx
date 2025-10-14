import { useState, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  Alert,
  ActivityIndicator,
  Pressable,
  Text,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Profile } from '../lib/types';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import '../global.css';

const MAX_CHARS = 280;

export default function NewPostScreen() {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (data) setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Diperlukan', 'Kami memerlukan izin galeri untuk memilih gambar.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePost = useCallback(async () => {
    setIsLoading(true);
    let imageUrl: string | null = null;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Anda harus login.');
      
      if (image) {
        const fileExt = image.split('.').pop()?.toLowerCase() ?? 'jpg';
        const fileName = `${new Date().getTime()}.${fileExt}`;
        const filePath = `${session.user.id}/${fileName}`;

        // Menggunakan FormData untuk stabilitas di mobile
        const formData = new FormData();
        formData.append('file', {
          uri: image,
          name: fileName,
          type: `image/${fileExt}`,
        } as any);

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, formData);
        
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }

      if (!content.trim() && !imageUrl) throw new Error("Postingan tidak boleh kosong.");
      
      const { error: insertError } = await supabase.from('posts').insert({ content, user_id: session.user.id, image_url: imageUrl });
      if (insertError) throw insertError;
      
      router.back();
    } catch (error: any) {
      console.error("DETAIL ERROR:", JSON.stringify(error, null, 2));
      Alert.alert('Gagal', error.message || 'Terjadi kesalahan.');
    } finally {
      setIsLoading(false);
    }
  }, [content, image, router]);

  const defaultAvatar = `https://api.dicebear.com/8.x/pixel-art/png?seed=${profile?.username}`;

  return (
    <Pressable onPress={() => router.back()} className="flex-1 justify-end bg-black/50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable>
            <View className="bg-white rounded-t-2xl">
              <View className="p-4">
                <View className="flex-row justify-between items-center pb-4">
                  <Pressable onPress={pickImage}>
                    <FontAwesome name="image" size={24} color="#1DA1F2" />
                  </Pressable>
                  <Text className="text-gray-500">{MAX_CHARS - content.length} Character left</Text>
                </View>
                
                <View className="flex-row space-x-4">
                  <Image
                    source={{ uri: profile?.avatar_url || defaultAvatar }}
                    className="w-10 h-10 rounded-full bg-gray-200"
                  />
                  <TextInput
                    value={content}
                    onChangeText={setContent}
                    placeholder="What's happening?"
                    multiline
                    autoFocus
                    maxLength={MAX_CHARS}
                    className="flex-1 text-lg h-24"
                    style={{ textAlignVertical: 'top' }}
                  />
                </View>

                {image && (
                  <View className="mt-4 relative h-40">
                    <Image source={{ uri: image }} className="w-full h-full rounded-xl" resizeMode="cover" />
                    <Pressable onPress={() => setImage(null)} className="absolute top-2 right-2 bg-black/70 rounded-full p-1">
                      <FontAwesome name="close" size={20} color="white" />
                    </Pressable>
                  </View>
                )}
              </View>

              <View className="p-4 border-t border-gray-200">
                <Pressable
                  onPress={handlePost}
                  disabled={isLoading || (!content.trim() && !image)}
                  className="bg-sky-500 w-full py-3 rounded-full disabled:opacity-50"
                >
                  {isLoading
                    ? <ActivityIndicator color="white" />
                    : <Text className="text-white text-center font-bold text-lg">Post</Text>
                  }
                </Pressable>
                <Pressable
                  onPress={() => router.back()}
                  className="w-full py-3 rounded-full mt-3 border border-gray-300"
                >
                  <Text className="text-black text-center font-bold text-lg">Cancel</Text>
                </Pressable>
              </View>
            </View>
        </Pressable>
      </KeyboardAvoidingView>
    </Pressable>
  );
}