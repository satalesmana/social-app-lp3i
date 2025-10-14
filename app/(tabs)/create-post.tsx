import { View, Text, TextInput, Modal, TouchableOpacity, Pressable, Image, Platform, ScrollView } from 'react-native'
import React, { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../../lib/supabase'
import * as FileSystem from 'expo-file-system'
import { Feather } from '@expo/vector-icons'
import { useWindowDimensions } from 'react-native'

interface CreatePostProps {
    visible: boolean
    onClose: () => void
    onPostCreated?: () => void
}

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export default function CreatePost({ visible, onClose, onPostCreated }: CreatePostProps) {
    const [content, setContent] = useState('')
    const [image, setImage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768; // You can adjust the breakpoint as needed

    const handleSubmit = async () => {
        if (!content && !image) return

        try {
            setIsLoading(true)
            let imageUrl = null

            if (image) {
                if (Platform.OS === 'web') {
                    // For web platform
                    const response = await fetch(image);
                    const blob = await response.blob();
                    const fileName = `post-${Date.now()}.jpg`;

                    const { data, error: uploadError } = await supabase.storage
                        .from('postingan') // Changed from 'social-apps' to 'postingan'
                        .upload(fileName, blob, {
                            contentType: 'image/jpeg'
                        });

                    if (uploadError) throw uploadError;

                    if (data) {
                        const { data: publicUrl } = supabase.storage
                            .from('postingan') // Changed from 'social-apps' to 'postingan'
                            .getPublicUrl(data.path);

                        imageUrl = publicUrl.publicUrl;
                    }
                } else {
                    // For native platforms
                    const base64 = await FileSystem.readAsStringAsync(image, {
                        encoding: FileSystem.EncodingType.Base64,
                    });

                    const fileName = `post-${Date.now()}.jpg`;

                    // Using direct upload instead of helper function
                    const { data, error: uploadError } = await supabase.storage
                        .from('postingan') // Changed from 'social-apps' to 'postingan'
                        .upload(fileName, decode(base64), {
                            contentType: 'image/jpeg'
                        });

                    if (uploadError) throw uploadError;

                    if (data) {
                        const { data: publicUrl } = supabase.storage
                            .from('postingan') // Changed from 'social-apps' to 'postingan'
                            .getPublicUrl(data.path);

                        imageUrl = publicUrl.publicUrl;
                    }
                }
            }

            // Create post
            const { error } = await supabase.from('postingan').insert({
                content: content,
                image_url: imageUrl,
                email: (await supabase.auth.getUser()).data.user?.email,
                created_at: new Date().toISOString()
            })

            if (error) throw error

            // Reset form and refresh posts
            setContent('')
            setImage(null)
            await onPostCreated?.() // Call the callback after successful post creation
        } catch (error) {
            console.error('Error creating post:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            base64: Platform.OS !== 'web'
        })

        if (!result.canceled) {
            setImage(result.assets[0].uri)
        }
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            {/* Backdrop with press-to-close */}
            <Pressable onPress={onClose} className={`flex-1 justify-end ${isDesktop ? 'items-center justify-center bg-black/50' : ''}`}>
                {/* Modal Content (pressable to prevent closing when interacting with it) */}
                <Pressable className={`w-full bg-white ${isDesktop ? 'max-w-xl rounded-2xl' : 'h-3/5 rounded-t-2xl'}`} style={!isDesktop ? { flex: 0, height: '60%' } : {}}>
                    <View className="p-4 flex-row justify-between items-center border-b border-gray-200">
                        <TouchableOpacity onPress={onClose}>
                            <Text className="text-sky-500">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`${(!content && !image) || isLoading ? 'bg-sky-300' : 'bg-sky-500'} px-4 py-1.5 rounded-full`}
                            onPress={handleSubmit}
                            disabled={!content && !image || isLoading}
                        >
                            <Text className="text-white font-semibold">
                                {isLoading ? 'Posting...' : 'Tweet'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView className="p-4">
                        <View className="flex-row">
                            <Image
                                source={{ uri: "https://api.dicebear.com/7.x/avataaars/png?seed=default" }}
                                className="w-10 h-10 rounded-full mr-3"
                            />
                            <TextInput
                                className="flex-1 text-lg"
                                multiline
                                placeholder="What's happening?"
                                value={content}
                                onChangeText={setContent}
                                autoFocus
                            />
                        </View>

                        {image && (
                            <View className="mt-4 relative">
                                <Image
                                    source={{ uri: image }}
                                    className="w-full h-[200px] rounded-xl"
                                    resizeMode="cover"
                                />
                                <TouchableOpacity
                                    className="absolute top-2 right-2 bg-black/50 rounded-full p-2"
                                    onPress={() => setImage(null)}
                                >
                                    <Feather name="x" size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>

                    {/* Footer */}
                    <View className="p-4 flex-row items-center border-t border-gray-200 mt-auto">
                        <TouchableOpacity
                            className="p-2 rounded-full"
                            onPress={pickImage}
                        >
                            <Feather name="image" size={24} color="#1DA1F2" />
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    )
}