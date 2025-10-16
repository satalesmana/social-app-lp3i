
import { Tabs, Stack, router } from 'expo-router';
import { View, Text, Pressable, TouchableOpacity, useWindowDimensions } from "react-native";
import { CreatePostModal } from '../../components/postmodal';
import { Feather } from "@expo/vector-icons";
import "../../global.css";
import { useState } from 'react';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [isDesktopModalVisible, setDesktopModalVisible] = useState(false);

  if(isDesktop){
    return (
      <View className="flex flex-row justify-center bg-white">
      {/* Sidebar Kiri */}
      <View className="w-1/5 h-screen p-4">
        <Text className="text-3xl font-bold mb-6 text-sky-500">Logo</Text>
        <Pressable className="flex-row items-center mb-4" onPress={() => router.push("/")}><Feather name="home" size={24} /><Text className="text-xl ml-3">Home</Text></Pressable>
        <Pressable className="flex-row items-center mb-4" onPress={() => router.push("/message")}><Feather name="message-circle" size={24} /><Text className="text-xl ml-3">Message</Text></Pressable>
        <Pressable className="flex-row items-center mb-4" onPress={() => router.push("/account")}><Feather name="user" size={24} /><Text className="text-xl ml-3">Account</Text></Pressable>
        <TouchableOpacity 
          onPress={() => setDesktopModalVisible(true)} 
          className="bg-sky-500 py-3 px-4 rounded-full mt-4"
        >
          <Text className="text-white text-center font-bold text-lg">Tweet</Text>
        </TouchableOpacity>
      </View>

      {/* Konten Utama */}
      <View className="w-2/5 h-screen border-x border-gray-200">
        <Stack>
          <Stack.Screen name='index' options={{title:"Home"}} />
          <Stack.Screen name='message' options={{ "headerShown": false }} />
          <Stack.Screen name='account' options={{ "headerShown": false }} />
        </Stack>
      </View>

      {/* Sidebar Kanan */}
      <View className="w-1/4 h-screen p-4">
        <Text className="text-xl font-bold">What's happening</Text>
      </View> 

      {/* Render Modal for Desktop */}
      <CreatePostModal 
        visible={isDesktopModalVisible}
        onClose={() => setDesktopModalVisible(false)}
      />
    </View>
    )
  }

  // Mobile layout 
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="message"
          options={{
            title: 'Message',
            tabBarIcon: ({ color }) => <Feather name="message-circle" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: 'Account',
            headerShown: false,
            tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} />,
          }}
        />
      </Tabs>
  );
}