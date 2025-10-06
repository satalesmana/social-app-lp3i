import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../lib/supabase";
import { useRouter } from "expo-router";

export default function CreatePost() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 📸 Pick an image from gallery
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to pick image.");
      console.error("Image picker error:", err);
    }
  };

  // ☁️ Upload image to Supabase Storage
  const uploadImage = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const fileName = `post-${Date.now()}.jpg`;

    const { error } = await supabase.storage
      .from("post-images")
      .upload(fileName, blob, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error.message);
      throw new Error("Failed to upload image.");
    }

    const { data: publicUrlData } = supabase.storage
      .from("post-images")
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  };

  // 📝 Handle Post Submit
  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert("Error", "Please write something before posting!");
      return;
    }

    try {
      setLoading(true);

      // ✅ Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error("You must be logged in.");

      // ✅ Upload image (if exists)
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage(image);
      }

      // ✅ Insert into Supabase
      const { error } = await supabase.from("postingan").insert([
        {
          user_id: user.id,
          email: user.email,
          content: content.trim(),
          image_url: imageUrl,
        },
      ]);

      if (error) {
        console.error("Insert error:", error.message);
        throw new Error(error.message);
      }

      Alert.alert("✅ Success", "Your post has been created!");
      router.push("/(tabs)/");
    } catch (error) {
      console.error("Post creation error:", error);
      Alert.alert("Error", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-5">
      <Text className="text-xl font-bold mb-3">Create a Post</Text>

      <TextInput
        placeholder="What's on your mind?"
        value={content}
        onChangeText={setContent}
        multiline
        className="border border-gray-300 rounded-lg p-3 text-base mb-3"
      />

      {image && (
        <Image
          source={{ uri: image }}
          className="w-full h-56 rounded-lg mb-3"
          resizeMode="cover"
        />
      )}

      <TouchableOpacity
        onPress={pickImage}
        disabled={loading}
        className="bg-gray-200 p-3 rounded-lg mb-3 items-center"
      >
        <Text>📸 Pick an Image</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handlePost}
        disabled={loading}
        className={`p-3 rounded-lg items-center ${
          loading ? "bg-blue-400" : "bg-blue-600"
        }`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold">Post</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
