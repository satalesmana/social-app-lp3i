import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL atau Anon Key tidak ditemukan! Pastikan app.json sudah benar.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
    .from('social-apps')
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
