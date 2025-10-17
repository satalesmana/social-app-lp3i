import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env'
import ImagePicker from 'react-native-image-picker'
import * as FileSystem from 'expo-file-system'

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
    .from('social-apps') // replace with your bucket name
    .upload(`${fileName}`, binary, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'image/jpeg', // or detect dynamically
    })

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  console.log('Uploaded file:', data)
  return data
}

export const getPublicUrl = (fileName: string) => {
  if (!fileName) {
    return null
  }

  const { data } = supabase.storage
    .from('social-apps') // Pastikan ini adalah nama bucket Anda
    .getPublicUrl(fileName)

  if (!data || !data.publicUrl) {
    console.error('Error getting public URL for', fileName)
    return null
  }
  return data.publicUrl
}

export const pickImage = async (mediaTypes: [ImagePicker.MediaType.IMAGE]) => {
  const result = await ImagePicker.launchImageLibrary({
    mediaTypes,
    quality: 0.5,
    maxWidth: 1000,
    maxHeight: 1000,
  })

  if (!result.uri) {
    console.log('No image selected')
    return null
  }

  // const base64 = await FileSystem.readAsStringAsync(result.uri, { encoding: 'base64' })
  const fileName = result.fileName || 'image.jpg'

  return { uri: result.uri, fileName }
}