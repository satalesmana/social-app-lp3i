import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})


export const uploadImage = async (
  base64: string,
  fileName: string,
  folder: string = "post-images" // folder default
) => {
  try {
    const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const uniqueFileName = `${Date.now()}-${fileName}`;

    // Deteksi tipe file
    const ext = fileName.split(".").pop()?.toLowerCase() || "jpeg";
    const contentType = `image/${ext === "jpg" ? "jpeg" : ext}`;

    // Upload ke folder dalam bucket "social-app"
    const { data, error } = await supabase.storage
      .from("social-apps")
      .upload(`${folder}/${uniqueFileName}`, binary, {
        cacheControl: "3600",
        upsert: true,
        contentType,
      });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    // Dapatkan URL publik
    const { data: publicUrlData } = supabase.storage
      .from("social-apps")
      .getPublicUrl(`${folder}/${uniqueFileName}`);

    console.log("✅ Uploaded:", publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error("Unexpected upload error:", err);
    return null;
  }
};
