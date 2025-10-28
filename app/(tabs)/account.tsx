import { FontAwesome5, Feather } from "@expo/vector-icons";
import { View, Text, Image, ScrollView, TouchableOpacity, Pressable } from "react-native";
import { supabase } from '../../lib/supabase';
import { router } from "expo-router"


export default function AccountPage(){
    const onSignOut=async()=>{
        const { error } = await supabase.auth.signOut({ scope: 'local' })

        if(!error){
            router.replace("login")
        }
    }

    const onEditProfile=()=>{
        router.push("edit-profile")
    }

    return(
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="bg-green-500 rounded-b-3xl pb-16 items-center">
          {/* Profile Image */}
          <Image
            source={{
              uri: "https://i.pravatar.cc/150?img=5", // demo avatar
            }}
            className="w-20 h-20 rounded-full mt-6 border-4 border-white"
          />
          <Text className="text-white text-lg font-semibold mt-2">Bill</Text>
          <Text className="text-white text-sm">nickedward@gmail.com</Text>
        </View>

        {/* Card Section */}
        <View className="mx-5 -mt-10 bg-white rounded-2xl p-5 shadow-md">
          {/* Buttons Row */}
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

          {/* Info Section */}
          <View className="space-y-4">
            <View className="flex-row justify-between">
              <Text className="text-gray-500">Name</Text>
              <Text className="text-green-600 font-medium">Sata Lesmana</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-500">E-mail</Text>
              <Text className="text-gray-700">demo@gmail.com</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-500">Gender:</Text>
              <Text className="text-gray-700">Male</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-500">Address:</Text>
              <Text className="text-gray-700 w-40 text-right">
                Jl. demo ts
              </Text>
            </View>
          </View>
        </View>

        <View className="mx-5 mt-5">
            <Pressable 
                onPress={onEditProfile}
                className="py-2 flex items-center justify-center h-[50px] rounded-2xl bg-[#22c55e]">
                <Text className="text-white">Edit Profile</Text>
            </Pressable>

            <Pressable 
                onPress={onSignOut}
                className="py-2 mt-4 flex items-center justify-center h-[50px] rounded-2xl bg-[#911b03]">
                <Text className="text-white">Logout</Text>
            </Pressable>
        </View>

      </ScrollView>
    )
}