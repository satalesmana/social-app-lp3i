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

export const uploadImage = async (base64: string, fileName: string) => {
  const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  const { data, error } = await supabase.storage
    .from('SOCIAL-APP-LP3I') // ganti dengan nama bucket kamu
    .upload(`${fileName}`, binary, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'image/jpeg',
    })

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  console.log('Uploaded file:', data)
  return data
}

// ✅ Fitur repost (integrasi Supabase)
export const addRepost = async (post_id: string, user_id: string) => {
  try {
    const { data, error } = await supabase
      .from("reposts")
      .insert([{ post_id, user_id }]);

    if (error) {
      console.error("Error adding repost:", error.message);
      return null;
    }

    console.log("Repost added:", data);
    return data;
  } catch (err) {
    console.error("Unexpected error in addRepost:", err);
    return null;
  }
};
