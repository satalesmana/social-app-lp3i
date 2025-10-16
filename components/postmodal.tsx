import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  useWindowDimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import { supabase, supabaseDb, uploadImage } from "../lib/supabase";

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
}

const MAX_CHARS = 300;

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
}) => {
  const [content, setContent] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [fileExt, setFileExt] = useState<string>("jpg");
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  /** 📸 Pilih gambar biasa */
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
      setFileExt("jpg");
    }
  };

  /** 🌀 Pilih file GIF */
  const pickGif = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: false,
      base64: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const isGif = asset.fileName?.toLowerCase().endsWith(".gif");

      if (!isGif) {
        Alert.alert("File bukan GIF", "Pilih file dengan ekstensi .gif saja.");
        return;
      }

      if (asset.base64) {
        setImageBase64(asset.base64);
        setFileExt("gif");
      }
    }
  };

  /** 📨 Upload Post */
  const handlePost = async () => {
    if (!content.trim() && !imageBase64) return;
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("User not authenticated.");

      let finalImageUrl: string | null = null;

      if (imageBase64) {
        const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
        const uploadResult = await uploadImage(imageBase64, fileName);

        finalImageUrl = uploadResult?.publicUrl || null;
        if (!finalImageUrl) throw new Error("Image upload failed.");
      }

      const postData = {
        user_id: session.user.id,
        content,
        image_url: finalImageUrl,
      };

      const { error: insertError } = await supabaseDb
        .from("posts")
        .insert(postData);
      if (insertError) throw insertError;

      setContent("");
      setImageBase64(null);
      onClose();
    } catch (error: any) {
      console.error("Post error:", error);
      Alert.alert("Error", error.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const defaultAvatar = "https://i.pravatar.cc/150?img=5";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View
        className={`flex-1 bg-black/50 ${
          isDesktop ? "justify-center items-center" : "justify-end"
        } items-center`}
      >
        <View
          className={`w-full ${
            isDesktop ? "max-w-[657px] rounded-3xl" : "rounded-t-3xl"
          } bg-white overflow-hidden`}
        >
          {/* HEADER - DESKTOP */}
          {isDesktop && (
            <View className="flex-row justify-between items-center px-4 py-6 ">
              <Pressable onPress={onClose} className="px-2 py-1">
                <Text className="text-gray-700 py-2 px-3 border-2 border-blue-400 rounded-full text-base font-medium">
                  Cancel
                </Text>
              </Pressable>
              <TouchableOpacity
                onPress={handlePost}
                disabled={loading || (!content.trim() && !imageBase64)}
                className="bg-sky-500 py-3 px-6 rounded-full disabled:opacity-50"
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-base">Post</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* HEADER - MOBILE (tetap di atas textbox) */}
          {!isDesktop && (
            <View className="bg-white border-b border-gray-300 pt-6 mb-5">
              <View className="items-center mb-2">
                <View className="w-8 h-1 bg-gray-300 rounded-full" />
              </View>

              <View className="flex-row items-center justify-between px-4">
                <View className="flex-row space-x-4">
                  <TouchableOpacity onPress={pickImage} className="p-2">
                    <Feather name="image" size={20} color="#38bdf8" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={pickGif} className="p-2">
                    <Feather name="film" size={20} color="#38bdf8" />
                  </TouchableOpacity>
                </View>
                <Text className="text-sm text-gray-500">
                  {MAX_CHARS - content.length} Character left
                </Text>
              </View>
            </View>
          )}

          {/* BODY */}
          <View className="px-4 min-h-[318px]">
            <View className="flex-row">
              <Image
                source={{ uri: defaultAvatar }}
                className="w-12 h-12 rounded-full mr-3"
              />
              <View className="flex-1">
                <TextInput
                  placeholder="What's happening?"
                  placeholderTextColor="#9ca3af"
                  className="text-lg text-gray-800 min-h-[100px]"
                  style={{ textAlignVertical: "top" }}
                  multiline
                  maxLength={MAX_CHARS}
                  value={content}
                  onChangeText={setContent}
                />

                {/* IMAGE PREVIEW */}
                {imageBase64 && (
                  <View className="mt-3 relative">
                    <Image
                      source={{
                        uri: `data:image/${fileExt};base64,${imageBase64}`,
                      }}
                      className="w-full h-48 rounded-2xl"
                      resizeMode="cover"
                    />
                    <Pressable
                      onPress={() => setImageBase64(null)}
                      className="absolute top-2 right-2 bg-black/60 p-2 rounded-full"
                    >
                      <Feather name="x" size={16} color="white" />
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* FOOTER - DESKTOP */}
          {isDesktop && (
            <View className="flex-row items-center justify-between px-6 py-3 border-t border-gray-200">
              <View className="flex-row space-x-4">
                <TouchableOpacity onPress={pickImage} className="p-2">
                  <Feather name="image" size={20} color="#38bdf8" />
                </TouchableOpacity>
                <TouchableOpacity onPress={pickGif} className="p-2">
                  <Feather name="film" size={20} color="#38bdf8" />
                </TouchableOpacity>
              </View>
              <Text className="text-sm text-gray-500">
                {MAX_CHARS - content.length} Character left
              </Text>
            </View>
          )}

          {/* FOOTER - MOBILE */}
          {!isDesktop && (
            <View className="px-4 pb-6 pt-2">
              <TouchableOpacity
                onPress={handlePost}
                disabled={loading || (!content.trim() && !imageBase64)}
                className="bg-sky-500 py-3 rounded-full disabled:opacity-50 items-center mb-3"
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-base">Post</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                className="bg-white border border-blue-400 py-3 rounded-full items-center"
              >
                <Text className="text-gray-700 font-medium text-base">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
