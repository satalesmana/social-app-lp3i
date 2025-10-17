import React, { useEffect, useState } from 'react';
import { View, Modal, TextInput, TouchableOpacity, Text, Image, Alert, Platform, useWindowDimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { Feather } from '@expo/vector-icons';


interface TweetModalProps {
  isVisible: boolean;
  onClose: () => void;
  onPost: (content: string, imageUri?: string | null) => void;
}

export default function TweetModal({ isVisible, onClose, onPost }: TweetModalProps) {
  const [tweetContent, setTweetContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageAsset, setImageAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);

  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  useEffect(() => {
    if (!isVisible) {
      setTweetContent('');
      setImageUri(null);
    }
  }, [isVisible]);


  const handlePost = async () => {
    if ((!tweetContent || !tweetContent.trim()) && !imageUri) {
      Alert.alert('Postingan Kosong', 'Silakan tambahkan teks atau foto sebelum memposting.');
      return;
    }

    setLoading(true);
    let publicUrl: string | null = null;
    if (imageAsset) {
      try {
        const fileExt = imageAsset.uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error: uploadError } = await supabase.storage
            .from('postingan')
            .upload(filePath, { uri: imageAsset.uri, name: fileName, type: `image/${fileExt}` }, {
                contentType: `image/${fileExt}`,
            });

        if (uploadError) {
            Alert.alert('Upload error', uploadError.message);
            console.error(uploadError);
            setLoading(false);
            return;
        }

        const url = supabase.storage.from('postingan').getPublicUrl(data.path).data.publicUrl;
        publicUrl = url;

      } catch (e: any) {
        Alert.alert('Gagal Upload', 'Gagal mengunggah gambar.');
        console.error(e);
        setLoading(false);
        return;
      }
    }

    // Save post to Supabase table
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Pengguna tidak ditemukan');

      const { error } = await supabase.from('postingan').insert({
        content: tweetContent,
        image_url: publicUrl,
        email: user.email, // Menyimpan email untuk ditampilkan di feed
        avatar_url: user.user_metadata?.avatar_url // Menyimpan avatar untuk ditampilkan
      });

      if (error) throw error;

    } catch (e: any) {
      Alert.alert('Post error', 'Failed to save post.');
      console.error(e);
      setLoading(false);
      return;
    }

    onPost(tweetContent, publicUrl);
    setTweetContent('');
    setImageUri(null);
    setImageAsset(null);
    setLoading(false);
    onClose();
    // Dispatch event so Home can refresh
    try {
      window.dispatchEvent(new Event('post:created'));
    } catch(e){}
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: false,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setImageAsset(result.assets[0]);
    }
  };

  return (
    <Modal
      animationType={isMobile ? 'slide' : 'fade'}
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: isMobile ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.5)',
          justifyContent: isMobile ? 'flex-end' : 'center',
          alignItems: 'center',
          padding: isMobile ? 0 : 16,
        }}
      >
        <View
          style={{
            width: isMobile ? '100%' : '100%',
            maxWidth: isMobile ? '100%' : 520,
            borderTopLeftRadius: isMobile ? 20 : 20,
            borderTopRightRadius: isMobile ? 20 : 20,
            borderRadius: isMobile ? 0 : 20,
            backgroundColor: 'white',
            marginBottom: isMobile ? 0 : undefined,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 8,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <View className="p-3 flex-row justify-between items-center border-b border-gray-200">
            <TouchableOpacity onPress={onClose} className="p-2">
              <Text className="text-black font-medium">Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handlePost}
              disabled={loading || (!tweetContent.trim() && !imageUri)}
              className={`px-4 py-1.5 rounded-full ${(!tweetContent.trim() && !imageUri) || loading ? 'bg-blue-300' : 'bg-[#1DA1F2]'}`}
            >
              <Text className="text-white font-semibold">{loading ? 'Mengirim...' : 'Kirim'}</Text>
            </TouchableOpacity>
          </View>

          {/* Content Area */}
          <View className="p-4">
            <View className="flex-row">
              <View className="mr-3">
                <View className="w-10 h-10 rounded-full bg-gray-300" />
              </View>

              <View className="flex-1">
                <TextInput
                  className="text-xl"
                  multiline
                  placeholder="Apa yang sedang terjadi?"
                  placeholderTextColor="#536471"
                  value={tweetContent}
                  onChangeText={setTweetContent}
                  autoFocus={true}
                  style={{ minHeight: 100 }}
                />

                {imageUri && (
                  <View className="mt-3 relative">
                    <View className="rounded-2xl overflow-hidden">
                      <Image source={{ uri: imageUri }} style={{ width: '100%', height: 200, borderRadius: 16 }} />
                    </View>
                    <TouchableOpacity 
                      onPress={() => setImageUri(null)}
                      className="absolute top-2 right-2 bg-black/50 rounded-full p-2"
                    >
                      <Text className="text-white">✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Footer */}
          <View className="px-4 py-3 border-t border-gray-100 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity 
                onPress={pickImage} 
                className="w-10 h-10 justify-center items-center rounded-full hover:bg-blue-50"
              >
                <Feather name="image" size={22} color="#1DA1F2" />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center">
              <View className="w-8 h-8 mr-3">
                {tweetContent.length > 0 && (
                  <View className="w-full h-full justify-center items-center">
                    <View className={`w-8 h-8 rounded-full border-2 ${tweetContent.length > 260 ? 'border-red-500' : 'border-[#1DA1F2]'} justify-center items-center`}>
                      <Text className={`text-xs ${tweetContent.length > 260 ? 'text-red-500' : 'text-[#1DA1F2]'}`}>
                        {280 - tweetContent.length}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}