import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@env";
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";

// 🔹 Inisialisasi Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * 🔸 Upload foto profil ke bucket `social-apps`
 */
export const uploadProfileImage = async (base64: string, fileName: string) => {
  try {
    const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const { data, error } = await supabase.storage
      .from("social-apps")
      .upload(fileName, binary, {
        cacheControl: "3600",
        upsert: true,
        contentType: "image/jpeg",
      });

    if (error) {
      console.error("Upload profile error:", error);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from("social-apps")
      .getPublicUrl(fileName);

    return publicData.publicUrl;
  } catch (err) {
    console.error("Upload profile failed:", err);
    return null;
  }
};

/**
 * 🔸 Upload gambar postingan ke bucket `postingan`
 * ✅ Fix: pakai FileSystem + Buffer agar aman di Android & iOS
 */
export const uploadPostImage = async (uri: string, fileName: string) => {
  try {
    // Baca file dari URI lokal (React Native)
    const fileBase64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Ubah base64 ke buffer
    const fileBuffer = Buffer.from(fileBase64, "base64");

    // Upload ke Supabase Storage
    const { data, error } = await supabase.storage
      .from("postingan")
      .upload(fileName, fileBuffer, {
        cacheControl: "3600",
        upsert: true,
        contentType: "image/jpeg",
      });

    if (error) {
      console.error("Upload postingan error:", error);
      return null;
    }

    // Ambil URL publik file yang diupload
    const { data: publicData } = supabase.storage
      .from("postingan")
      .getPublicUrl(fileName);

    return publicData.publicUrl;
  } catch (err) {
    console.error("Upload failed:", err);
    return null;
  }
};
