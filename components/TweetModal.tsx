import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  TextInput,
  SafeAreaView,
  useWindowDimensions,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Entypo, Feather } from "@expo/vector-icons";
import { useTweetModal } from "../context/TweetModalContext";
import * as ImagePicker from "expo-image-picker";
import { supabase, uploadImage } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";
import { router } from "expo-router";

interface TweetModalProps {
  handleCloseModal: () => void;
}

export default function TweetModal({ handleCloseModal }: TweetModalProps) {
  const { isOpen, closeModal } = useTweetModal();
  const [input, setInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Izin Diperlukan",
          "Akses galeri diperlukan untuk memilih gambar."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });

      if (!result.canceled) {
        setImage(result.assets[0].base64 as string);
        setImageName(result.assets[0].fileName ?? "image.jpg");
      }
    } catch (err: any) {
      Alert.alert("Terjadi Kesalahan", err.message || "Gagal membuka galeri");
    }
  };

  const sendPost = async () => {
    if (!input.trim()) return;

    let imageUrl = "";

    // Upload hanya jika image ada
    if (image && imageName) {
      try {
        imageUrl = await uploadImage(image, imageName);
      } catch (err) {
        console.error("Upload gagal:", err);
        imageUrl = ""; // fallback biar gak error
      }
    }

    const { error } = await supabase.from("postingan").insert({
      user_id: session?.user.id,
      content: input,
      email: session?.user.email,
      image_url: imageUrl, // tetap dikirim walau kosong
    });

    if (error) {
      console.error("Error sending post:", error);
    } else {
      console.log("Postingan berhasil dikirim tanpa gambar!");
      setInput("");
      setImage(null);
      setImageName(null);
      closeModal();
    }
  };

  if (!isOpen) return null;

  return (
    <View className="absolute inset-0 bg-black/40 z-50">
      {isDesktop ? (
        // 🖥️ Tampilan versi desktop
        <View className="flex-1 justify-center items-center px-4">
          <View className="bg-white w-full max-w-xl rounded-2xl p-4 shadow-lg">
            <View className="flex-row justify-between items-center mb-3">
              <Pressable onPress={closeModal}>
                <View className="px-2 py-1 border border-blue-600 rounded-full">
                  <Text>Cancel</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={sendPost}
                className="bg-blue-500 px-5 py-1 rounded-full"
              >
                <Text className="text-white font-medium">Post</Text>
              </Pressable>
            </View>

            <View className="flex-row gap-3">
              <Image
                source={{ uri: "https://i.pravatar.cc/150?img=5" }}
                className="w-10 h-10 rounded-full border border-gray-300"
              />
              <TextInput
                multiline
                numberOfLines={4}
                placeholder="What's happening..."
                onChangeText={setInput}
                value={input}
                className="flex-1 resize-none bg-transparent border border-gray-200 p-3 rounded-lg mb-2"
              />
            </View>

            {image && (
              <Image
                source={{ uri: `data:image/jpeg;base64,${image}` }}
                className="w-48 h-48 rounded-xl mb-2 mx-auto"
                resizeMode="cover"
              />
            )}

            <View className="flex-row justify-between items-center border-t border-gray-200 pt-3 mt-3">
              <Pressable onPress={pickImage}>
                <View className="px-3 py-2 rounded-full hover:bg-slate-300 transition duration-300">
                  <Entypo name="image" size={16} color="#2563eb" />
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <SafeAreaView className="flex-1 justify-end bg-black/40">
            <View className="bg-white w-full rounded-t-2xl p-4 shadow-lg">
              {/* Handle bar atas */}

              <Pressable onPress={handleCloseModal}>
                <View className="items-center mb-12">
                  <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </View>
              </Pressable>

              {/* Header */}
              <View className="flex-row justify-between items-center mb-3 border-b border-gray-200">
                <Pressable onPress={pickImage}>
                  <View className="px-3 py-2 rounded-full">
                    <Entypo name="image" size={28} color="#2563eb" />
                  </View>
                </Pressable>
              </View>

              {/* Input */}
              <View className="flex-row gap-3">
                <Image
                  source={{ uri: "https://i.pravatar.cc/150?img=5" }}
                  className="w-10 h-10 rounded-full border border-gray-300"
                />
                <TextInput
                  multiline
                  numberOfLines={15}
                  placeholder="What's happening?"
                  onChangeText={setInput}
                  value={input}
                  className="flex-1 bg-gray-50 p-3 pb-24 rounded-xl text-gray-800 text-2xl"
                />
              </View>

              {/* Preview Gambar */}
              {image && (
                <Image
                  source={{ uri: `data:image/jpeg;base64,${image}` }}
                  className="w-48 h-48 rounded-xl mb-3 mx-auto mt-2"
                  resizeMode="cover"
                />
              )}

              {/* Footer */}
              <TouchableOpacity className="flex border-t border-gray-200 pt-3 mt-3 w-full">
                <View className="flex flex-col gap-3">
                  <Pressable
                    onPress={sendPost}
                    className="bg-sky-500 px-6 py-4 rounded-3xl w-full items-center"
                  >
                    <Text className="text-white font-medium text-md">Post</Text>
                  </Pressable>

                  <TouchableOpacity
                    onPress={handleCloseModal}
                    className="flex border border-gray-400 px-5 py-4 rounded-full w-full items-center"
                  >
                    <Text className="text-gray-600 font-medium text-md">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
