import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_URL_2,SUPABASE_ANON_KEY_2 } from '@env'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export const supabaseProfile = createClient(SUPABASE_URL_2, SUPABASE_ANON_KEY_2)

// === PROFILE FUNCTIONS ===

export type Profile = {
  id: string
  name: string | null
  email: string | null
  gender: string | null
  contact: string | null
  avatar_url: string | null
  created_at?: string
  updated_at?: string
}

/**
 * Get user profile by ID
 */
export const getProfile = async (userId: string) => {
  const { data, error } = await supabaseProfile
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data as Profile
}

/**
 * Update user profile
 */
export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabaseProfile
  .from('profiles')
  .upsert({
    id: userId,
    ...updates,
    updated_at: new Date().toISOString(), // Hanya perbarui updated_at

  })
  .select()
  .single()

  if (error) {
    console.error('Error updating profile:', error)
    throw error
  }

  return data as Profile
}

/**
 * Upload avatar image to Profile Storage
 */
export const uploadAvatar = async (userId: string, base64: string, fileName: string) => {
  try {
    const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const fileExt = fileName.split('.').pop();
    const contentType = `image/${fileExt}`; // Dinamis berdasarkan ekstensi file
    const filePath = `${userId}/${new Date().getTime()}.${fileExt}`; // Nama file unik

    const { data, error } = await supabaseProfile.storage
      .from('avatars')
      .upload(filePath, binary, {
        cacheControl: '3600',
        upsert: true, // Upsert untuk menimpa file jika ada
        contentType,
      });

    if (error) throw error;

    const { data: urlData } = supabaseProfile.storage
      .from('avatars')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadAvatar:', error);
    throw error;
  }
}

/**
 * Delete avatar
 */
export const deleteAvatar = async (avatarUrl: string) => {
    if (!avatarUrl) return; // Jangan lakukan apa-apa jika URL kosong

    try {
        const bucketName = 'avatars';
        // Ekstrak path file dari URL lengkap
        const pathStartIndex = avatarUrl.indexOf(`/${bucketName}/`) + bucketName.length + 2;
        const filePath = avatarUrl.substring(pathStartIndex);

        if (!filePath) {
            console.error("Could not extract file path from URL:", avatarUrl);
            return;
        }

        const { error } = await supabaseProfile.storage
            .from(bucketName)
            .remove([filePath]);

        if (error) {
            // Jangan lempar error jika file tidak ditemukan, anggap saja sudah terhapus
            if (error.message !== 'The resource was not found') {
                 console.error('Error deleting file from storage:', error.message);
                 throw error;
            }
        }
    } catch (error) {
        console.error('Exception in deleteAvatar:', error);
        throw error;
    }
};