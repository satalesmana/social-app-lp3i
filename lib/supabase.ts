import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@env";
import * as FileSystem from "expo-file-system";

//Inisialisasi Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/*Upload gambar postingan ke bucket postingan*/
export const uploadPostImage = async (uri: string, fileName: string) => {
  try {
    // Ambil file info untuk dapatkan type (image/jpeg / image/png)
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) throw new Error("File tidak ditemukan");

    // Siapkan file untuk upload
    const formData = new FormData();
    formData.append("file", {
      uri,
      name: fileName,
      type: "image/jpeg",
    } as any);

    //Upload via fetch langsung ke endpoint Supabase Storage
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/postingan/${fileName}`;
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Upload gagal: ${res.status} ${errText}`);
    }

    // Ambil URL publik
    const { data: publicData } = supabase.storage
      .from("postingan")
      .getPublicUrl(fileName);

    console.log("✅ Upload sukses:", publicData.publicUrl);
    return publicData.publicUrl;
  } catch (err) {
    console.error("❌ Upload error:", err);
    return null;
  }
};
