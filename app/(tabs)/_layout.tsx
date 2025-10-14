import { Tabs, Stack, router } from 'expo-router';
import { View, Text, Pressable, TouchableOpacity, useWindowDimensions, Modal } from "react-native";
import "../../global.css"
import { useState } from 'react';
import CreatePost from './create-post';
import Feather from 'react-native-vector-icons/Feather';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    setRefreshKey(prev => prev + 1);
    setShowModal(false);
  };

  if (isDesktop) {
    return (
      <View className="flex flex-row flex-wrap justify-center">
        <View className="w-1/6  h-screen">
          <Text className="text-xl font-bold mb-6">Logo</Text>
          <Pressable
            className="text-lg mb-4"
            onPress={() => router.push("/")}>
            Home
          </Pressable>

          <Pressable
            className="text-lg mb-4"
            onPress={() => router.push("/message")}>
            Message
          </Pressable>

          <Pressable
            className="text-lg mb-4"
            onPress={() => router.push("/account")}>
            Account
          </Pressable>

          <TouchableOpacity
            className="bg-sky-500 py-2 px-4 rounded-md"
            onPress={() => setShowModal(true)}
          >
            <Text className="text-white text-center">Tweet</Text>
          </TouchableOpacity>
        </View>

        <View className="w-2/5 h-screen border-x border-gray-200 mx-4">
          <Stack>
            <Stack.Screen name='index' options={{ title: "Home", headerBackVisible: false }} />
            <Stack.Screen name='message' options={{ title: "Message", headerBackVisible: false }} />
            <Stack.Screen name='account' options={{ title: "Account", headerBackVisible: false }} />
          </Stack>
          <CreatePost
            visible={showModal}
            onClose={() => setShowModal(false)}
            onPostCreated={handlePostCreated}
          />
        </View>

        <View className="w-1/6  h-scree">
          <Text>whats happening!!</Text>
        </View>
      </View>
    )
  }

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: 'blue'
    }}>
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
          tabBarIcon: ({ color }) => <Feather name="message-square" size={24} color={color} />,
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
      <Tabs.Screen
        name="create-post"
        options={{
          href: null, // This will hide the tab from the tab bar
        }}
      />
    </Tabs>
  );
}