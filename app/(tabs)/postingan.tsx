import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { supabase, uploadPostImage } from "../../lib/supabase";

export default function Postingan() {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fungsi pilih gambar
  const pickImage = async () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async (event: any) => {
        const file = event.target.files[0];
        if (file) {
          const url = URL.createObjectURL(file);
          setImage(url);
        }
      };
      input.click();
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    }
  };

  // Fungsi posting ke Supabase
  const handlePost = async () => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();

      if (!session || !session.user?.email) {
        Alert.alert("Error", "Kamu harus login terlebih dahulu!");
        return;
      }

      const email = session.user.email;
      let imageUrl = null;

      // Upload gambar jika ada
      if (image) {
        const fileName = `postingan_${Date.now()}.jpg`;

        if (Platform.OS === "web") {
          const blob = await fetch(image).then(res => res.blob());
          const { data, error } = await supabase.storage
            .from("postingan")
            .upload(fileName, blob, {
              upsert: true,
              contentType: "image/jpeg",
            });
          if (error) throw error;

          const { data: publicUrlData } = supabase.storage
            .from("postingan")
            .getPublicUrl(fileName);

          imageUrl = publicUrlData.publicUrl;
        } else {
          imageUrl = await uploadPostImage(image, fileName);
        }

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

      // ✅ Navigasi sesuai platform
      if (Platform.OS === "web") {
        window.alert("Postingan berhasil ditambahkan!");
        router.replace("/(tabs)");
      } else {
        Alert.alert("Sukses", "Postingan berhasil ditambahkan!", [
          { text: "OK", onPress: () => router.replace("/(tabs)") },
        ]);
      }

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
