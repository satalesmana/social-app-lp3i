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
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString()
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
    const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
    const fileExt = fileName.split('.').pop()
    const filePath = `${userId}/avatar.${fileExt}`

    const { data, error } = await supabaseProfile.storage
      .from('avatars')
      .upload(filePath, binary, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/jpeg',
      })

    if (error) throw error

    const { data: urlData } = supabaseProfile.storage
      .from('avatars')
      .getPublicUrl(filePath)

    return urlData.publicUrl
  } catch (error) {
    console.error('Error in uploadAvatar:', error)
    throw error
  }
}

/**
 * Delete avatar
 */
export const deleteAvatar = async (userId: string) => {
  const { error } = await supabaseProfile.storage
    .from('avatars')
    .remove([
      `${userId}/avatar.jpg`, 
      `${userId}/avatar.jpeg`, 
      `${userId}/avatar.png`
    ])

  if (error) console.error('Error deleting avatar:', error)
}