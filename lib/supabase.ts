// lib/supabase.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env'
import { Platform } from 'react-native'
import 'react-native-url-polyfill/auto'
import { decode } from 'base64-arraybuffer'

// ✅ Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

/**
 * ✅ Convert base64 string → Blob
 * Works well on both mobile and web
 */
export const base64ToBlob = (base64: string, contentType = 'image/jpeg') => {
  const byteCharacters = atob(base64)
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512)
    const byteNumbers = new Array(slice.length)

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }

  return new Blob(byteArrays, { type: contentType })
}

/**
 * ✅ Universal Upload Function
 * - Accepts `File` on web or `base64` string on mobile
 * - Uploads to Supabase Storage
 * - Returns public URL
 */
export const uploadImage = async (fileOrBase64: any, fileName: string) => {
  try {
    let fileToUpload: any

    if (Platform.OS === 'web') {
      // Web: fileOrBase64 should be File
      fileToUpload = fileOrBase64
    } else {
      // Mobile: fileOrBase64 should be base64 string
      fileToUpload = base64ToBlob(fileOrBase64)
    }

    const { error } = await supabase.storage
      .from('post-images') // 👈 bucket name
      .upload(fileName, fileToUpload, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/jpeg',
      })

    if (error) {
      console.error('❌ Upload error:', error)
      return null
    }

    const { data: publicUrlData } = supabase
      .storage
      .from('post-images')
      .getPublicUrl(fileName)

    return publicUrlData.publicUrl
  } catch (err) {
    console.error('❌ Unexpected upload error:', err)
    return null
  }
}
