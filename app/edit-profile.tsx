import { View, Text, Pressable, TextInput, Image, ScrollView, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react"
import { router } from "expo-router"
import * as ImagePicker from 'expo-image-picker';
import { supabase, getProfile, updateProfile, uploadAvatar, Profile } from '../lib/supabase';
import { AlertDialog } from '../components/global/Alert';
import "../global.css"

export default function EditProfile(){
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)
    
    // Form states
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [gender, setGender] = useState("")
    const [contact, setContact] = useState("")
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    
    // Image picker states
    const [imageBase64, setImageBase64] = useState<string | null>(null)
    const [imageName, setImageName] = useState<string | null>(null)
    
    // Alert states
    const [showAlert, setShowAlert] = useState(false)
    const [alertTitle, setAlertTitle] = useState("")
    const [alertMessage, setAlertMessage] = useState("")

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            setFetching(true)
            const { data: { session } } = await supabase.auth.getSession()
            
            if (!session?.user) {
                router.replace("login")
                return
            }

            setUserId(session.user.id)
            const profile = await getProfile(session.user.id)
            
            if (profile) {
                setName(profile.name || "")
                setEmail(profile.email || session.user.email || "")
                setGender(profile.gender || "")
                setContact(profile.contact || "")
                setAvatarUrl(profile.avatar_url)
            } else {
                setEmail(session.user.email || "")
            }
        } catch (error) {
            console.error("Error loading profile:", error)
            showAlertDialog("Error", "Failed to load profile")
        } finally {
            setFetching(false)
        }
    }

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled) {
            setImageBase64(result.assets[0].base64 as string)
            setImageName(result.assets[0].fileName || "avatar.jpg")
            // Preview local image
            setAvatarUrl(result.assets[0].uri)
        }
    }

    const showAlertDialog = (title: string, message: string) => {
        setAlertTitle(title)
        setAlertMessage(message)
        setShowAlert(true)
    }

    const onSave = async () => {
        if (!userId) return

        try {
            setLoading(true)

            // Validation
            if (!name.trim()) {
                showAlertDialog("Validation Error", "Name is required")
                return
            }

            if (contact && contact.length < 10) {
                showAlertDialog("Validation Error", "Contact number must be at least 10 digits")
                return
            }

            let newAvatarUrl = avatarUrl

            // Upload avatar if changed
            if (imageBase64 && imageName) {
                newAvatarUrl = await uploadAvatar(userId, imageBase64, imageName)
            }

            // Update profile
            await updateProfile(userId, {
                name: name.trim(),
                email: email.trim(),
                gender: gender || null,
                contact: contact.trim() || null,
                avatar_url: newAvatarUrl,
            })

            showAlertDialog("Success", "Profile updated successfully!")
            
            // Reset image states
            setImageBase64(null)
            setImageName(null)

            // Navigate back after short delay
            setTimeout(() => {
                router.back()
            }, 1500)

        } catch (error: any) {
            console.error("Error saving profile:", error)
            showAlertDialog("Error", error.message || "Failed to update profile")
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#22c55e" />
            </View>
        )
    }

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="p-5">
                {/* Avatar Section */}
                <View className="items-center mb-6">
                    <Pressable onPress={pickImage} className="relative">
                        {avatarUrl ? (
                            <Image
                                source={{ uri: avatarUrl }}
                                className="w-32 h-32 rounded-full border-4 border-green-500"
                            />
                        ) : (
                            <View className="w-32 h-32 rounded-full bg-gray-200 items-center justify-center border-4 border-green-500">
                                <Text className="text-gray-400 text-4xl">👤</Text>
                            </View>
                        )}
                        <View className="absolute bottom-0 right-0 bg-green-500 w-10 h-10 rounded-full items-center justify-center border-2 border-white">
                            <Text className="text-white text-lg">📷</Text>
                        </View>
                    </Pressable>
                    <Text className="text-gray-500 text-sm mt-2">Tap to change photo</Text>
                </View>

                {/* Form Section */}
                <View className="space-y-4">
                    {/* Name */}
                    <View>
                        <Text className="text-gray-700 font-medium mb-2">Name *</Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            className="border border-gray-300 rounded-xl px-4 py-3 text-base"
                        />
                    </View>

                    {/* Email (Read-only) */}
                    <View>
                        <Text className="text-gray-700 font-medium mb-2">Email</Text>
                        <TextInput
                            value={email}
                            editable={false}
                            className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50 text-gray-500"
                        />
                        <Text className="text-gray-400 text-xs mt-1">Email cannot be changed</Text>
                    </View>

                    {/* Gender */}
                    <View>
                        <Text className="text-gray-700 font-medium mb-2">Gender</Text>
                        <View className="flex-row space-x-3">
                            {['Male', 'Female', 'Other'].map((g) => (
                                <Pressable
                                    key={g}
                                    onPress={() => setGender(g)}
                                    className={`flex-1 py-3 rounded-xl border-2 items-center ${
                                        gender === g 
                                            ? 'border-green-500 bg-green-50' 
                                            : 'border-gray-300 bg-white'
                                    }`}
                                >
                                    <Text className={gender === g ? 'text-green-600 font-medium' : 'text-gray-600'}>
                                        {g}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* Contact */}
                    <View>
                        <Text className="text-gray-700 font-medium mb-2">Contact Number</Text>
                        <TextInput
                            value={contact}
                            onChangeText={setContact}
                            placeholder="e.g. 08123456789"
                            keyboardType="phone-pad"
                            className="border border-gray-300 rounded-xl px-4 py-3 text-base"
                        />
                    </View>
                </View>

                {/* Save Button */}
                <Pressable 
                    onPress={onSave}
                    disabled={loading}
                    className={`mt-8 py-4 rounded-xl items-center justify-center ${
                        loading ? 'bg-gray-400' : 'bg-green-500'
                    }`}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-semibold text-base">Save Changes</Text>
                    )}
                </Pressable>
            </View>

            <AlertDialog
                visible={showAlert}
                title={alertTitle}
                message={alertMessage}
                onClose={() => setShowAlert(false)}
            />
        </ScrollView>
    )
}