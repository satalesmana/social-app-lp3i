import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase, uploadPostImage } from "../lib/supabase";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function PostModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const screenHeight = Dimensions.get("window").height;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    if (Platform.OS !== "web") {
      if (visible) {
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [visible]);

  // === PILIH GAMBAR ===
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
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    }
  };

  // === UPLOAD POST ===
  const handlePost = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session || !session.user?.email) {
        Alert.alert("Error", "Kamu harus login terlebih dahulu!");
        return;
      }

      const email = session.user.email;
      let imageUrl = null;

      if (image) {
        const fileName = `postingan_${Date.now()}.jpg`;
        if (Platform.OS === "web") {
          const blob = await fetch(image).then((res) => res.blob());
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
      }

      const { error } = await supabase.from("postingan").insert([
        { email, content, image_url: imageUrl },
      ]);
      if (error) throw error;

      Alert.alert("Sukses", "Postingan berhasil ditambahkan!");
      setContent("");
      setImage(null);
      onClose();
      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Upload gagal:", err);
      Alert.alert("Error", err.message || "Terjadi kesalahan saat posting.");
    } finally {
      setLoading(false);
    }
  };

  // ---- Web: center modal ----
  if (Platform.OS === "web") {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.webOverlay}>
          <View style={styles.webCard}>
            {/* Header */}
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={onClose}>
                <Text style={{ color: "#1DA1F2", fontWeight: "600" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePost}
                disabled={loading}
                style={[
                  styles.postButton,
                  { opacity: loading ? 0.6 : 1 },
                ]}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {loading ? "Posting..." : "Post"}
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="What's happening?"
              value={content}
              onChangeText={setContent}
              multiline
              style={styles.textInput}
            />

            {image && <Image source={{ uri: image }} style={styles.previewImage} />}

            <View style={styles.bottomRow}>
              <TouchableOpacity onPress={pickImage}>
                <Ionicons name="image-outline" size={22} color="#1DA1F2" />
              </TouchableOpacity>
              <Text style={{ color: "#999", fontSize: 12 }}>
                300 Characters left
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // ---- Mobile: bottom sheet ----
  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={20}
            style={styles.mobileSheet}
          >
            {/* Header */}
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={onClose}>
                <Text style={{ color: "#1DA1F2", fontWeight: "600" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePost}
                disabled={loading}
                style={[
                  styles.postButton,
                  { opacity: loading ? 0.6 : 1 },
                ]}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {loading ? "Posting..." : "Post"}
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Apa yang sedang kamu pikirkan?"
              value={content}
              onChangeText={setContent}
              multiline
              style={styles.textInput}
            />

            {image && <Image source={{ uri: image }} style={styles.previewImage} />}

            <View style={styles.bottomRow}>
              <TouchableOpacity onPress={pickImage}>
                <Ionicons name="image-outline" size={22} color="#1DA1F2" />
              </TouchableOpacity>
              <Text style={{ color: "#999", fontSize: 12 }}>
                300 Characters left
              </Text>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  webOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  webCard: {
    backgroundColor: "white",
    width: 480,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  postButton: {
    backgroundColor: "#1DA1F2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  textInput: {
    minHeight: 80,
    fontSize: 16,
    textAlignVertical: "top",
    marginBottom: 10,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mobileSheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
});
