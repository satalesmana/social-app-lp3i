import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "./_layout";

export default function PostingPage() {
  const { darkMode } = useTheme();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // ambil session user aktif
  const uploadPost = async () => {
    try {
      setUploading(true);

      // ambil data user login
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Gagal", "Kamu harus login terlebih dahulu.");
        setUploading(false);
        return;
      }

      let image_url = null;

      // jika user pilih gambar
      if (image) {
        const fileExt = image.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `postingan/${fileName}`;

        const img = await fetch(image);
        const blob = await img.blob();

        const { error: uploadError } = await supabase.storage
          .from("images") // nama bucket storage kamu (ubah jika beda)
          .upload(filePath, blob, {
            contentType: "image/jpeg",
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("images")
          .getPublicUrl(filePath);

        image_url = publicUrlData.publicUrl;
      }

      // simpan ke tabel "postingan"
      const { error } = await supabase.from("postingan").insert([
        {
          user_id: user.id,
          email: user.email,
          content: content,
          image_url: image_url,
        },
      ]);

      if (error) throw error;

      Alert.alert("Berhasil", "Postingan kamu berhasil diunggah!");
      setContent("");
      setImage(null);
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.message);
    } finally {
      setUploading(false);
    }
  };

  // pilih gambar dari galeri
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <ScrollView
      className={`flex-1 p-5 ${darkMode ? "bg-neutral-900" : "bg-white"}`}
    >
      <Text
        className={`text-2xl font-bold mb-4 ${
          darkMode ? "text-white" : "text-black"
        }`}
      >
        Buat Postingan Baru
      </Text>

      <TextInput
        placeholder="Tulis sesuatu..."
        placeholderTextColor={darkMode ? "#aaa" : "#555"}
        value={content}
        onChangeText={setContent}
        multiline
        className={`border rounded-2xl p-4 h-32 mb-4 ${
          darkMode
            ? "bg-neutral-800 border-neutral-700 text-white"
            : "bg-gray-100 border-gray-300 text-black"
        }`}
      />

      {image && (
        <Image
          source={{ uri: image }}
          style={{
            width: "100%",
            height: 200,
            borderRadius: 15,
            marginBottom: 10,
          }}
        />
      )}

      <TouchableOpacity
        onPress={pickImage}
        className={`flex-row items-center justify-center p-3 rounded-2xl mb-4 ${
          darkMode ? "bg-neutral-700" : "bg-gray-200"
        }`}
      >
        <Ionicons name="image-outline" size={20} color={darkMode ? "#fff" : "#000"} />
        <Text
          className={`ml-2 ${darkMode ? "text-white" : "text-black"}`}
        >
          Pilih Gambar
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        disabled={uploading}
        onPress={uploadPost}
        className={`flex-row items-center justify-center p-4 rounded-2xl ${
          uploading
            ? "bg-gray-400"
            : darkMode
            ? "bg-blue-600"
            : "bg-blue-500"
        }`}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="send" size={20} color="#fff" />
            <Text className="text-white font-semibold ml-2">Kirim Postingan</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
