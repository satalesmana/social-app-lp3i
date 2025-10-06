import { View, Text, Pressable, Image, Platform, Alert } from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

export default function EditAccount() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Pilih gambar dari galeri
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setImage(asset.base64 as string);
      setImageName(asset.fileName || `profile_${Date.now()}.jpg`);
      setPreviewUri(asset.uri);
    }
  };

  // 🔹 Upload gambar ke bucket `social-apps`
  const onSave = async () => {
    if (!image || !imageName) {
      Platform.OS === "web"
        ? window.alert("Pilih gambar terlebih dahulu!")
        : Alert.alert("Error", "Pilih gambar terlebih dahulu!");
      return;
    }

    try {
      setLoading(true);

      // Ubah base64 → binary (Uint8Array)
      const binary = Uint8Array.from(atob(image), (c) => c.charCodeAt(0));

      // Upload ke Supabase Storage (bucket: social-apps)
      const { data, error } = await supabase.storage
        .from("social-apps")
        .upload(imageName, binary, {
          cacheControl: "3600",
          upsert: true,
          contentType: "image/jpeg",
        });

      if (error) {
        console.error("Upload error:", error);
        Platform.OS === "web"
          ? window.alert("Gagal mengupload gambar.")
          : Alert.alert("Error", "Gagal mengupload gambar.");
        return;
      }

      // Ambil URL publik
      const { data: publicUrlData } = supabase.storage
        .from("social-apps")
        .getPublicUrl(imageName);

      const imageUrl = publicUrlData.publicUrl;

      // 🔹 Notifikasi sukses
      if (Platform.OS === "web") {
        window.alert("Foto berhasil diubah!");
        router.replace("/(tabs)/account");
      } else {
        Alert.alert("Sukses", "Foto berhasil diubah!", [
          { text: "OK", onPress: () => router.replace("/(tabs)/account") },
        ]);
      }

      console.log("Image uploaded successfully:", imageUrl);
    } catch (err) {
      console.error("Upload error:", err);
      Platform.OS === "web"
        ? window.alert("Terjadi kesalahan saat upload.")
        : Alert.alert("Error", "Terjadi kesalahan saat upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="p-5 flex-1 items-center justify-center">
      {/* Tombol pilih gambar */}
      <Pressable
        onPress={pickImage}
        className="flex-row items-center justify-center bg-purple-500 px-6 py-3 rounded-full shadow-lg"
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      >
        <Ionicons name="image-outline" size={20} color="white" style={{ marginRight: 8 }} />
        <Text className="text-white font-bold text-lg">Select Image</Text>
      </Pressable>

      {/* Preview gambar */}
      {previewUri && (
        <Image
          source={{ uri: previewUri }}
          style={{
            width: 250,
            height: 250,
            marginTop: 20,
            borderRadius: 15,
            borderWidth: 2,
            borderColor: "#ccc",
          }}
        />
      )}

      {/* Tombol simpan */}
      <Pressable
        onPress={onSave}
        disabled={loading}
        className={`mt-8 py-3 px-8 flex-row items-center justify-center rounded-2xl ${
          loading ? "bg-gray-400" : "bg-green-500"
        }`}
      >
        <Text className="text-white font-semibold">
          {loading ? "Sedang proses..." : "Save"}
        </Text>
      </Pressable>
    </View>
  );
}
