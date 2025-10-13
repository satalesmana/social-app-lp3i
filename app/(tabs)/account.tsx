import { FontAwesome5, Feather } from "@expo/vector-icons";
import { View, Text, Image, ScrollView, TouchableOpacity, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { useState, useEffect, useCallback } from "react"
import { supabase, getProfile, Profile } from '../../lib/supabase';
import { router, useFocusEffect } from "expo-router"
import "../../global.css"

export default function AccountPage(){
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [userId, setUserId] = useState<string | null>(null)

    // useEffect(() => {
    //     loadProfile()
    // }, [])

    useFocusEffect(
      useCallback(() => {
        loadProfile()
      }, [])
    )


    const loadProfile = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            
            if (!session?.user) {
                router.replace("login")
                return
            }

            setUserId(session.user.id)
            const profileData = await getProfile(session.user.id)
            setProfile(profileData)
        } catch (error) {
            console.error("Error loading profile:", error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        loadProfile()
    }, [])

    const onSignOut = async () => {
        const { error } = await supabase.auth.signOut({ scope: 'local' })

        if(!error){
            router.replace("login")
        }
    }

    const onEditProfile = () => {
        router.push("edit-profile")
    }

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#22c55e" />
            </View>
        )
    }

    return(
        <ScrollView 
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header */}
            <View className="bg-green-500 rounded-b-3xl pb-16 items-center">
                {/* Profile Image */}
                {profile?.avatar_url ? (
                    <Image
                        source={{ uri: profile.avatar_url }}
                        className="w-24 h-24 rounded-full mt-6 border-4 border-white"
                    />
                ) : (
                    <View className="w-24 h-24 rounded-full mt-6 border-4 border-white bg-white items-center justify-center">
                        <Text className="text-5xl">👤</Text>
                    </View>
                )}
                
                <Text className="text-white text-xl font-semibold mt-3">
                    {profile?.name || "No Name"}
                </Text>
                <Text className="text-white/90 text-sm mt-1">
                    {profile?.email || "No Email"}
                </Text>
            </View>

            {/* Card Section */}
            <View className="mx-5 -mt-10 bg-white rounded-2xl p-5 shadow-md">
                {/* Quick Actions Row */}
                <View className="flex-row justify-between mb-6">
                    <TouchableOpacity className="items-center">
                        <View className="bg-green-100 p-4 rounded-xl">
                            <FontAwesome5 name="wallet" size={20} color="#22c55e" />
                        </View>
                        <Text className="text-xs mt-2">Payment</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="items-center">
                        <View className="bg-green-100 p-4 rounded-xl">
                            <Feather name="settings" size={20} color="#22c55e" />
                        </View>
                        <Text className="text-xs mt-2">Settings</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="items-center">
                        <View className="bg-green-100 p-4 rounded-xl">
                            <Feather name="bell" size={20} color="#22c55e" />
                        </View>
                        <Text className="text-xs mt-2">Notification</Text>
                    </TouchableOpacity>
                </View>

                {/* Profile Info Section */}
                <View className="space-y-4">
                    <View className="flex-row justify-between py-3 border-b border-gray-100">
                        <Text className="text-gray-500 font-medium">Name</Text>
                        <Text className="text-gray-800 font-medium">
                            {profile?.name || "-"}
                        </Text>
                    </View>

                    <View className="flex-row justify-between py-3 border-b border-gray-100">
                        <Text className="text-gray-500 font-medium">Email</Text>
                        <Text className="text-gray-800 text-right flex-1 ml-4">
                            {profile?.email || "-"}
                        </Text>
                    </View>

                    <View className="flex-row justify-between py-3 border-b border-gray-100">
                        <Text className="text-gray-500 font-medium">Gender</Text>
                        <Text className="text-gray-800 font-medium">
                            {profile?.gender || "-"}
                        </Text>
                    </View>

                    <View className="flex-row justify-between py-3">
                        <Text className="text-gray-500 font-medium">Contact</Text>
                        <Text className="text-gray-800 font-medium">
                            {profile?.contact || "-"}
                        </Text>
                    </View>
                </View>
            </View>

            <View className="mx-5 mt-5 mb-8">
                <Pressable 
                    onPress={onEditProfile}
                    className="py-4 flex items-center justify-center rounded-2xl bg-green-500 shadow-sm"
                >
                    <Text className="text-white font-semibold text-base">Edit Profile</Text>
                </Pressable>

                <Pressable 
                    onPress={onSignOut}
                    className="py-4 mt-4 flex items-center justify-center rounded-2xl bg-red-600 shadow-sm"
                >
                    <Text className="text-white font-semibold text-base">Logout</Text>
                </Pressable>
            </View>
        </ScrollView>
    )
}