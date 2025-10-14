import { useState, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
  Pressable,
  Text,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Profile } from '../lib/types';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import '../global.css';

type NewPostModalProps = {
  isVisible: boolean;
  onClose: () => void;
};

export default function NewPostModal({ isVisible, onClose }: NewPostModalProps) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const fetchProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (data) setProfile(data);
        }
      };
      fetchProfile();
    }
  }, [isVisible]);

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Diperlukan', 'Kami memerlukan izin galeri untuk memilih gambar.');
        return;
      }
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

  const handleClose = useCallback(() => {
    if (isLoading) return;
    setContent('');
    setImage(null);
    onClose();
  }, [isLoading, onClose]);
  
  const handlePost = useCallback(async () => {
    setIsLoading(true);
    let imageUrl: string | null = null;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Anda harus login.');
      
      if (image) {
        const response = await fetch(image);
        const blob = await response.blob();
        
        const fileExt = blob.type.split('/')[1] ?? 'jpg';
        const path = `${session.user.id}/${new Date().getTime()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(path, blob, { 
            contentType: blob.type,
            upsert: true
          });
        
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      if (!content.trim() && !imageUrl) throw new Error("Postingan tidak boleh kosong.");
      
      const { error: insertError } = await supabase.from('posts').insert({ content, user_id: session.user.id, image_url: imageUrl });
      if (insertError) throw insertError;
      
      handleClose();
    } catch (error: any) {
      console.error("DETAIL ERROR:", JSON.stringify(error, null, 2));
      Alert.alert('Gagal', error.message || 'Terjadi kesalahan.');
    } finally {
      setIsLoading(false);
    }
  }, [content, image, handleClose]);

  const defaultAvatar = `https://api.dicebear.com/8.x/pixel-art/png?seed=${profile?.username}`;

  return (
    <Modal animationType="fade" transparent={true} visible={isVisible} onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <View style={styles.modalContainer} className="bg-white rounded-2xl w-[600px]">
        
        <View className="flex-row justify-between items-center p-4 border-b border-gray-200 ">
          <Pressable onPress={handleClose} className="p-2 rounded-full hover:bg-gray-100 ">
            <Text className="text-gray-500 font-bold text-base">Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handlePost}
            disabled={isLoading || (!content.trim() && !image)}
            className="bg-sky-500 rounded-full py-2 px-6 disabled:opacity-50"
          >
            {isLoading 
              ? <ActivityIndicator color="white" />
              : <Text className="text-white font-bold text-base">Post</Text>
            }
          </Pressable>
        </View>

        <View className="p-4">
          <View className="flex-row space-x-4">
            <Image
              source={{ uri: profile?.avatar_url || defaultAvatar }}
              className="w-12 h-12 rounded-full bg-gray-200"
            />
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="What's happening?!"
              placeholderTextColor="gray"
              multiline
              className="flex-1 text-xl text-black h-24"
              style={{ textAlignVertical: 'top' }}
            />
          </View>

          {image && (
            <View className="mt-3 relative">
              <Image source={{ uri: image }} className="w-full h-72 rounded-xl" />
              <Pressable onPress={() => setImage(null)} className="absolute top-2 right-2 bg-black/70 rounded-full p-1">
                <FontAwesome name="close" size={20} color="white" />
              </Pressable>
            </View>
          )}

          <View className="flex-row items-center mt-4">
            <Pressable onPress={pickImage} className="p-2 rounded-full hover:bg-sky-100">
              <FontAwesome name="image" size={22} color="#1DA1F2" />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    position: 'absolute',
    top: '10%',
    alignSelf: 'center',
  },
});