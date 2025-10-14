// app/(tabs)/_layout.tsx

import { Tabs, Stack, router } from 'expo-router';
import { View, Text, Pressable, TouchableOpacity, useWindowDimensions } from "react-native";
import { useState } from 'react';
import NewPostModal from '../../components/NewPostModal';
import "../../global.css"
import { FontAwesome } from '@expo/vector-icons';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [isModalVisible, setModalVisible] = useState(false);

  if(isDesktop){
    return (
      <View className="flex flex-row flex-wrap justify-center">
        {/* Kolom Kiri */}
        <View className="w-1/6 h-screen">
          <FontAwesome name="twitter" size={28} color="#1DA1F2" className="text-xl font-bold my-3"/>
          <Pressable className="text-lg mb-4" onPress={()=> router.push("/")}>Home</Pressable>
          <Pressable className="text-lg mb-4" onPress={()=> router.push("/message")}>Message</Pressable>
          <Pressable className="text-lg mb-4" onPress={()=> router.push("/account")}>Account</Pressable>
          <TouchableOpacity 
            className="bg-sky-500 py-2 px-4 rounded-full mt-4"
            onPress={() => setModalVisible(true)}
          >
            <Text className="text-white text-center font-bold">Tweet</Text>
          </TouchableOpacity>
        </View>

        {/* Kolom Tengah */}
        <View className="w-2/5 h-screen border-x border-gray-200 mx-4">
          <Stack>
            <Stack.Screen name='index' options={{title:"Home"}} />
            <Stack.Screen name='message' options={{title:"Message"}} />
            <Stack.Screen name='account' options={{title:"Account", headerShown: false}} />
          </Stack>
        </View>

        {/* Kolom Kanan */}
        <View className="w-1/6 h-screen">
          <Text>Trending</Text>
        </View>

        {/* Modal untuk Web */}
        <NewPostModal
          isVisible={isModalVisible}
          onClose={() => setModalVisible(false)}
        />
      </View>
    )
  }

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          title: 'Message',
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          headerShown: false
        }}
      />
    </Tabs>
  );
}