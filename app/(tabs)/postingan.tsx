import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  Alert, 
  ScrollView, 
  Platform 
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../lib/supabase";
import { router } from "expo-router";

export default function Postingan() {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // 🔥 state loading

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadPost = async () => {
    try {
      setLoading(true); // mulai loading

      let imageUrl = null;

      if (image) {
        const fileName = `post-${Date.now()}.jpg`;
        const response = await fetch(image);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from("postingan")
          .upload(fileName, blob, {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("postingan")
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

      const { error: insertError } = await supabase.from("postingan").insert([
        {
          user_id: "292bf5be-b3e3-4f21-a883-0581d8638ecf", // ganti pakai user login
          email: "adiprimavoc123@gmail.com", // ganti pakai email login
          content,
          image_url: imageUrl,
        },
      ]);

      if (insertError) throw insertError;

      Alert.alert("Sukses", "Postingan berhasil diupload!");
      setContent("");
      setImage(null);

      // arahkan balik ke _layout (Home)
      router.replace("/");

    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false); // selesai loading
    }
  };

  return (
    <ScrollView className="flex-1 p-4 bg-white">
      <Text className="text-xl font-bold mb-4">Buat Postingan</Text>

      <TextInput
        placeholder="Tulis sesuatu..."
        value={content}
        onChangeText={setContent}
        className="border border-gray-300 rounded-md p-2 mb-4"
        multiline
      />

      {image && (
        <Image source={{ uri: image }} style={{ width: "100%", height: 200, marginBottom: 10 }} />
      )}

      <TouchableOpacity
        onPress={pickImage}
        style={{
          backgroundColor: "#3498db",
          padding: 12,
          borderRadius: 8,
          marginBottom: 10,
        }}
      >
        
        <Text style={{ color: "#fff", textAlign: "center" }}>Pilih Gambar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={uploadPost}
        disabled={loading}
        className={`py-3 px-4 rounded-md ${loading ? "bg-gray-400" : "bg-green-500"}`}
      >
        <Text className="text-white text-center font-semibold">
          {loading ? "Mengupload..." : "Upload"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
