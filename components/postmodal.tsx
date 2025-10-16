// components/CreatePostModal.tsx

import React, { useState } from "react";
import { Modal, View, Text, Pressable, TextInput, TouchableOpacity, ActivityIndicator, Image, Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { Feather } from "@expo/vector-icons";
import { supabase, supabaseDb, uploadImage } from '../lib/supabase';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
}

const MAX_CHARS = 300;

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ visible, onClose }) => {
  const [content, setContent] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      setImageBase64(result.assets[0].base64);
    }
  };

  const handlePost = async () => {
    if (!content.trim() && !imageBase64) return;
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("User not authenticated.");

      let finalImageUrl: string | null = null;
      if (imageBase64) {
        const fileName = `${session.user.id}/${Date.now()}.jpg`;
        const uploadResult = await uploadImage(imageBase64, fileName);
        finalImageUrl = uploadResult?.fullPath || null;
        if (!finalImageUrl) throw new Error("Image upload failed.");
      }

      // Data yang dikirim sesuai dengan field di tabel Anda
      const postData = {
        user_id: session.user.id,
        content: content,
        image_url: finalImageUrl,
      };

      const { error: insertError } = await supabaseDb.from('posts').insert(postData);
      if (insertError) throw insertError;

      setContent('');
      setImageBase64(null);
      onClose();

    } catch (error: any) {
      Alert.alert("Error", error.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };
  
  const defaultAvatar = 'https://i.pravatar.cc/150?img=5';

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-center items-center p-4">
        <View className="w-full max-w-xl bg-white rounded-2xl shadow-lg">
          {/* Header */}
          <View className="flex-row justify-between items-center p-3 border-b border-gray-200">
            <Pressable onPress={onClose} className="p-2"><Text className="text-lg">Cancel</Text></Pressable>
            <TouchableOpacity onPress={handlePost} disabled={loading || (!content.trim() && !imageBase64)} className="bg-sky-500 py-2 px-6 rounded-full disabled:bg-sky-300">
              {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text className="text-white font-bold text-base">Post</Text>}
            </TouchableOpacity>
          </View>
          {/* Body */}
          <View className="p-4 flex-row">
            <Image source={{ uri: defaultAvatar }} className="w-12 h-12 rounded-full mr-4" />
            <View className="flex-1">
              <TextInput placeholder="What's happening?" placeholderTextColor="#9ca3af" className="text-lg min-h-[120px]" style={{textAlignVertical: 'top'}} multiline maxLength={MAX_CHARS} value={content} onChangeText={setContent} />
              {imageBase64 && (
                <View className="mt-3 relative">
                  <Image source={{ uri: `data:image/jpeg;base64,${imageBase64}` }} className="w-full h-48 rounded-2xl" />
                  <Pressable onPress={() => setImageBase64(null)} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full"><Feather name="x" size={18} color="white" /></Pressable>
                </View>
              )}
            </View>
          </View>
          {/* Footer */}
          <View className="flex-row justify-between items-center p-4 border-t border-gray-200">
            <TouchableOpacity onPress={pickImage}><Feather name="image" size={22} color="#38bdf8" /></TouchableOpacity>
            <Text className="text-gray-500">{MAX_CHARS - content.length} left</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};