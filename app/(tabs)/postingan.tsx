import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase, uploadPostImage } from "../../lib/supabase";

export default function Postingan() {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fungsi pilih gambar dari galeri
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Fungsi kirim postingan ke Supabase
  const handlePost = async () => {
    try {
      setLoading(true);

      // Ambil session user aktif
      const { data: { session } } = await supabase.auth.getSession();

      if (!session || !session.user?.email) {
        Alert.alert("Error", "Kamu harus login terlebih dahulu!");
        return;
      }

      const email = session.user.email;
      let imageUrl = null;

      // Upload gambar jika ada
      if (image) {
        const ext = image.split(".").pop()?.toLowerCase() || "jpg";
        const fileName = `postingan_${Date.now()}.${ext}`;
        imageUrl = await uploadPostImage(image, fileName);

        if (!imageUrl) {
          Alert.alert("Error", "Gagal mengupload gambar.");
          return;
        }
      }

      // Insert data ke tabel postingan
      const { error } = await supabase.from("postingan").insert([
        { email, content, image_url: imageUrl },
      ]);

      if (error) throw error;

      Alert.alert("Sukses", "Postingan berhasil ditambahkan!");
      setContent("");
      setImage(null);
    } catch (err: any) {
      console.error("Upload gagal:", err);
      Alert.alert("Error", err.message || "Terjadi kesalahan saat posting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TextInput
        placeholder="Apa yang kamu pikirkan?"
        value={content}
        onChangeText={setContent}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          borderRadius: 8,
          marginBottom: 10,
        }}
      />

      {image && (
        <Image
          source={{ uri: image }}
          style={{
            width: "100%",
            height: 200,
            marginBottom: 10,
            borderRadius: 8,
          }}
        />
      )}

      <TouchableOpacity
        onPress={pickImage}
        style={{
          padding: 12,
          backgroundColor: "#ddd",
          borderRadius: 8,
          marginBottom: 10,
        }}
      >
        <Text>Pilih Gambar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handlePost}
        disabled={loading}
        style={{
          padding: 12,
          backgroundColor: "blue",
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          {loading ? "Mengirim..." : "Posting"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
