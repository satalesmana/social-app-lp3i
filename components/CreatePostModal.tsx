import React, { useState } from "react";
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Pressable,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";

export default function UploadModalFormData({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [image, setImage] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [content, setContent] = useState("");
  const maxChars = 300;

  const pickImage = async (e?: React.ChangeEvent<HTMLInputElement>) => {
    if (Platform.OS === "web") {
      const selectedFile = e?.target.files?.[0];
      if (selectedFile) setFile(selectedFile);
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled) setImage(result.assets[0]);
    }
  };

  const uploadImageUniversal = async () => {
    if (!file && !image) return null;
    const filePath = `posts/${Date.now()}.jpg`;

    if (Platform.OS === "web" && file) {
      const { error } = await supabase.storage
        .from("post-images")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });
      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(filePath);
      return urlData.publicUrl;
    } else if (image) {
      const formData = new FormData();
      formData.append("file", {
        uri: image.uri,
        name: "image.jpg",
        type: "image/jpeg",
      } as any);

      const { error } = await supabase.storage
        .from("post-images")
        .upload(filePath, formData, { contentType: "image/jpeg", upsert: true });
      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(filePath);
      return urlData.publicUrl;
    }
    return null;
  };

  const handlePost = async () => {
    setUploading(true);
    try {
      const imageUrl = await uploadImageUniversal();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error: insertError } = await supabase.from("postingan").insert([
        {
          content: content || null,
          image_url: imageUrl || null,
          email: user?.email || null,
          user_id: user?.id || null,
        },
      ]);

      if (insertError) throw insertError;
      setContent("");
      setFile(null);
      setImage(null);
      onClose();
    } catch (err) {
      console.error("❌ Post failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const isDisabled = uploading || (!content && !file && !image);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "flex-end" }}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
          onPress={onClose}
        />
        <View
          style={{
            backgroundColor: "#fff",
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 32,
            width: Platform.OS === "web" ? 600 : "100%",
            maxHeight: "80%",
            alignSelf: "center",
            ...(Platform.OS === "web"
              ? {
                  borderRadius: 20,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 10,
                  elevation: 8,
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: [{ translateX: -300 }, { translateY: -250 }],
                }
              : {
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                }),
          }}
        >
          {/* ================= MOBILE FRONTEND ================= */}
          {Platform.OS !== "web" ? (
            <>
              {/* Top Row with icons and counter */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                {/* Left Icons */}
                <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                  <TouchableOpacity onPress={() => pickImage()}>
                    <Image
                      source={require("../assets/photoicn.png")}
                      style={{ width: 28, height: 28 }}
                    />
                  </TouchableOpacity>
                  <Image
                    source={require("../assets/gificn.png")}
                    style={{ width: 28, height: 28 }}
                  />
                </View>

                {/* Right Counter */}
                <Text style={{ color: "#6b7280" }}>
                  {maxChars - content.length} left
                </Text>
              </View>

              {/* Separator */}
              <View
                style={{
                  height: 1,
                  backgroundColor: "#e5e7eb",
                  marginBottom: 16,
                }}
              />

              {/* Profile + Input */}
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <Image
                  source={{
                    uri:
                      "https://ui-avatars.com/api/?name=User&background=2563eb&color=fff",
                  }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    marginRight: 12,
                  }}
                />
                <TextInput
                  value={content}
                  onChangeText={(text) =>
                    text.length <= maxChars && setContent(text)
                  }
                  placeholder="What's happening?"
                  multiline
                  style={{
                    flex: 1,
                    fontSize: 18,
                    minHeight: 100,
                    textAlignVertical: "top",
                    paddingTop: 4,
                  }}
                />
              </View>

              {/* Image preview */}
              {(file || image) && (
                <View style={{ marginTop: 12, alignItems: "center" }}>
                  <Image
                    source={{ uri: file ? URL.createObjectURL(file) : image.uri }}
                    style={{
                      width: "100%",
                      height: 250,
                      borderRadius: 12,
                    }}
                    resizeMode="cover"
                  />
                </View>
              )}

              {/* Buttons - POST ABOVE CANCEL */}
              <TouchableOpacity
                onPress={handlePost}
                disabled={isDisabled}
                style={{
                  backgroundColor: isDisabled ? "#93C5FD" : "#2563eb",
                  paddingVertical: 14,
                  borderRadius: 10,
                  alignItems: "center",
                  marginTop: 20,
                  width: "100%",
                }}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
                    Post
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                style={{
                  backgroundColor: "#e5e7eb",
                  paddingVertical: 14,
                  borderRadius: 10,
                  alignItems: "center",
                  marginTop: 10,
                  width: "100%",
                }}
              >
                <Text style={{ color: "#000", fontWeight: "600", fontSize: 16 }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            /* ================= WEB FRONTEND ================= */
            <>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <TouchableOpacity onPress={onClose}>
                  <Text
                    style={{ color: "#2563eb", fontSize: 16, fontWeight: "600" }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <Image
                  source={{
                    uri:
                      "https://ui-avatars.com/api/?name=User&background=2563eb&color=fff",
                  }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    marginRight: 12,
                  }}
                />
                <TextInput
                  value={content}
                  onChangeText={(text) =>
                    text.length <= maxChars && setContent(text)
                  }
                  placeholder="What's happening?"
                  multiline
                  style={{
                    flex: 1,
                    fontSize: 18,
                    minHeight: 100,
                    textAlignVertical: "top",
                    paddingTop: 4,
                  }}
                />
              </View>

              {(file || image) && (
                <View style={{ marginTop: 12, alignItems: "center" }}>
                  <Image
                    source={{ uri: file ? URL.createObjectURL(file) : image.uri }}
                    style={{
                      width: "100%",
                      height: 250,
                      borderRadius: 12,
                    }}
                    resizeMode="cover"
                  />
                </View>
              )}

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 20,
                }}
              >
                <View
                  style={{ flexDirection: "row", gap: 12, alignItems: "center" }}
                >
                  <label htmlFor="fileInput" style={{ cursor: "pointer" }}>
                    <Image
                      source={require("../assets/photoicn.png")}
                      style={{ width: 24, height: 24 }}
                    />
                  </label>
                  <Image
                    source={require("../assets/gificn.png")}
                    style={{ width: 24, height: 24 }}
                  />
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    onChange={pickImage}
                    style={{ display: "none" }}
                  />
                </View>

                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
                >
                  <Text style={{ color: "#6b7280" }}>
                    {maxChars - content.length} left
                  </Text>
                  <TouchableOpacity
                    onPress={handlePost}
                    disabled={isDisabled}
                    style={{
                      backgroundColor: isDisabled ? "#93C5FD" : "#2563eb",
                      paddingHorizontal: 24,
                      paddingVertical: 10,
                      borderRadius: 25,
                    }}
                  >
                    {uploading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={{ color: "#fff", fontWeight: "600" }}>
                        Post
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
