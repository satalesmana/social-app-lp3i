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

/**
 * Upload foto profil ke bucket `social-apps`
 */
export const uploadProfileImage = async (base64: string, fileName: string) => {
  const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  const { data, error } = await supabase.storage
    .from('social-apps')
    .upload(fileName, binary, {
      cacheControl: '3600',
      upsert: true,
      contentType: 'image/jpeg',
    })

  if (error) {
    console.error('Upload profile error:', error)
    return null
  }

  const { data: publicData } = supabase.storage
    .from('social-apps')
    .getPublicUrl(fileName)

  return publicData.publicUrl
}

/**
 * Upload gambar untuk postingan ke bucket `postingan`
 */
export const uploadPostImage = async (uri: string, fileName: string) => {
  try {
    const response = await fetch(uri)
    const blob = await response.blob()

    const { data, error } = await supabase.storage
      .from('postingan') // bucket khusus postingan
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/jpeg',
      })

    if (error) {
      console.error('Upload postingan error:', error)
      return null
    }

    const { data: publicData } = supabase.storage
      .from('postingan')
      .getPublicUrl(fileName)

    return publicData.publicUrl
  } catch (err) {
    console.error('Upload failed:', err)
    return null
  }
}
