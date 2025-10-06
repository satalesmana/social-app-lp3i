import { View, Text, Pressable, TextInput, Image, ScrollView, ActivityIndicator, Modal } from "react-native";
import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import { supabase, getProfile, updateProfile, uploadAvatar, deleteAvatar, Profile } from '../lib/supabase';
import "../global.css";

interface CustomAlertDialogProps {
    visible: boolean;
    title: string;
    message?: string;
    onClose: () => void;
    actions?: { text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }[];
    children?: React.ReactNode;
}

const CustomAlertDialog = ({ visible, title, message, onClose, actions, children }: CustomAlertDialogProps) => {
    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable className="flex-1 justify-center items-center bg-black/50 p-5" onPress={onClose}>
                <Pressable className="bg-white rounded-lg p-5 w-11/12 max-w-sm" onPress={(e) => e.stopPropagation()}>
                    <Text className="text-xl font-bold mb-3 text-gray-800">{title}</Text>
                    {message && <Text className="text-gray-600 mb-4">{message}</Text>}
                    {children}
                    <View className="flex-col mt-4 space-y-3">
                        {actions ? (
                            actions.map((action, index) => (
                                <Pressable
                                    key={index}
                                    onPress={() => { action.onPress(); onClose(); }}
                                    className={`py-3 rounded-lg items-center ${
                                        action.style === 'destructive' ? 'bg-red-500' : 
                                        action.style === 'cancel' ? 'bg-gray-200' : 'bg-green-500'
                                    }`}
                                >
                                    <Text className={`font-semibold text-base ${
                                        action.style === 'destructive' ? 'text-white' : 
                                        action.style === 'cancel' ? 'text-gray-700' : 'text-white'
                                    }`}>{action.text}</Text>
                                </Pressable>
                            ))
                        ) : (
                            <Pressable onPress={onClose} className="py-3 rounded-lg items-center bg-green-500">
                                <Text className="font-semibold text-base text-white">OK</Text>
                            </Pressable>
                        )}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};


const Input = ({ label, value, onChangeText, placeholder, editable = true, keyboardType, hint }: any) => (
    <View>
        <Text className="text-gray-700 font-medium mb-2">{label}</Text>
        <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            editable={editable}
            keyboardType={keyboardType}
            className={`border border-gray-300 rounded-xl px-4 py-3 text-base ${!editable && 'bg-gray-50 text-gray-500'}`}
        />
        {hint && <Text className="text-gray-400 text-xs mt-1">{hint}</Text>}
    </View>
);

const GenderSelector = ({ selectedGender, onSelect }: { selectedGender: string, onSelect: (gender: string) => void }) => (
    <View>
        <Text className="text-gray-700 font-medium mb-2">Gender</Text>
        <View className="flex-row space-x-3">
            {['Male', 'Female'].map((g) => (
                <Pressable
                    key={g}
                    onPress={() => onSelect(g)}
                    className={`flex-1 py-3 rounded-xl border-2 items-center ${
                        selectedGender === g 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-300 bg-white'
                    }`}
                >
                    <Text className={selectedGender === g ? 'text-green-600 font-medium' : 'text-gray-600'}>
                        {g}
                    </Text>
                </Pressable>
            ))}
        </View>
    </View>
);


export default function EditProfile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [gender, setGender] = useState("");
    const [contact, setContact] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [imageName, setImageName] = useState<string | null>(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertTitle, setAlertTitle] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [showPhotoOptionsDialog, setShowPhotoOptionsDialog] = useState(false);
    const [showFullPhotoViewer, setShowFullPhotoViewer] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) { router.replace("/login"); return; }
                
                setUserId(session.user.id);
                const profileData = await getProfile(session.user.id);
                setProfile(profileData);
                
                if (profileData) {
                    setName(profileData.name || "");
                    setEmail(profileData.email || session.user.email || "");
                    setGender(profileData.gender || "");
                    setContact(profileData.contact || "");
                    setAvatarUrl(profileData.avatar_url);
                } else {
                    setEmail(session.user.email || "");
                }
            } catch (error) {
                showAlertDialog("Error", "Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled) {
            setImageBase64(result.assets[0].base64 as string);
            setImageName(result.assets[0].fileName || "avatar.jpg");
            setAvatarUrl(result.assets[0].uri);
        }
    };

    const removeImage = () => {
        setAvatarUrl(null);
        setImageBase64(null);
        setImageName(null);
    };

    const showAlertDialog = (title: string, message: string) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setShowAlert(true);
    };

    const onSave = async () => {
        if (!userId) return;
        setSaving(true);
        try {
            if (!name.trim()) {
                showAlertDialog("Validation Error", "Name is required");
                return;
            }

            const updates: Partial<Profile> = {
                name: name.trim(),
                email: email,
                gender: gender || null,
                contact: contact.trim() || null,
            };

            if (imageBase64 && imageName) {
                if (profile?.avatar_url) {
                    await deleteAvatar(profile.avatar_url);
                }
                const newAvatarUrl = await uploadAvatar(userId, imageBase64, imageName);
                updates.avatar_url = newAvatarUrl;
            } 
            else if (!avatarUrl && profile?.avatar_url) {
                await deleteAvatar(profile.avatar_url);
                updates.avatar_url = null;
            }
            
            await updateProfile(userId, updates);
            showAlertDialog("Success", "Profile updated successfully!");
            setTimeout(() => router.back(), 1500);

        } catch (error: any) {
            showAlertDialog("Error", error.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color="#22c55e" /></View>;
    }

    const photoOptionsActions = [
        ...(avatarUrl ? [{ text: "View Photo", onPress: () => setShowFullPhotoViewer(true) }] : []),
        { text: "Change Photo", onPress: pickImage },
        ...(avatarUrl ? [{ text: "Remove Photo", onPress: removeImage, style: 'destructive' as const }] : []),
        { text: "Cancel", onPress: () => {}, style: 'cancel' as const }
    ];

    return (
        <ScrollView className="flex-1 bg-white p-5">
            <View className="items-center mb-6">
                <Pressable onPress={() => setShowPhotoOptionsDialog(true)} className="relative">
                    {avatarUrl ? (
                        <Image source={{ uri: avatarUrl }} className="w-32 h-32 rounded-full border-4 border-green-500" />
                    ) : (
                        <View className="w-32 h-32 rounded-full bg-gray-200 items-center justify-center border-4 border-green-500">
                            <Text className="text-gray-400 text-4xl">👤</Text>
                        </View>
                    )}
                    <View className="absolute bottom-0 right-0 bg-green-500 w-10 h-10 rounded-full items-center justify-center border-2 border-white">
                        <Text className="text-white text-lg">📷</Text>
                    </View>
                </Pressable>
                <Text className="text-gray-500 mt-2 text-sm">Tap to edit photo</Text>
            </View>

            <View className="space-y-4">
                <Input label="Name *" value={name} onChangeText={setName} placeholder="Enter your name" />
                <Input label="Email" value={email} editable={false} hint="Email cannot be changed" />
                <GenderSelector selectedGender={gender} onSelect={setGender} />
                <Input label="Contact Number" value={contact} onChangeText={setContact} placeholder="e.g. 08123456789" keyboardType="phone-pad" />
            </View>

            <Pressable 
                onPress={onSave}
                disabled={saving}
                className={`mt-8 py-4 rounded-xl items-center justify-center ${saving ? 'bg-gray-400' : 'bg-green-500'}`}
            >
                {saving ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold text-base">Save Changes</Text>}
            </Pressable>
            
            <CustomAlertDialog visible={showAlert} title={alertTitle} message={alertMessage} onClose={() => setShowAlert(false)} />
            <CustomAlertDialog visible={showPhotoOptionsDialog} title="Profile Photo Options" onClose={() => setShowPhotoOptionsDialog(false)} actions={photoOptionsActions} />
            <CustomAlertDialog visible={showFullPhotoViewer} title="Profile Photo" onClose={() => setShowFullPhotoViewer(false)} actions={[{ text: "Close", onPress: () => {}, style: 'cancel' as const }]}>
                {avatarUrl && <Image source={{ uri: avatarUrl }} className="w-full h-64 resize-contain mb-4" />}
            </CustomAlertDialog>
        </ScrollView>
    );
}