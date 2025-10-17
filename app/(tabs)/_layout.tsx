import { Tabs, Stack, router } from 'expo-router';
import { View, Text, Pressable, TouchableOpacity, useWindowDimensions, Image, ScrollView } from "react-native";
import "../../global.css"
import { useState } from 'react';
import TweetModal from '../../components/TweetModal';
import { Feather } from '@expo/vector-icons';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768; // switch layout for tablet/desktop
  const [isTweetModalVisible, setIsTweetModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Handler for posting a tweet from the modal
  const handlePost = (content: string, imageUri?: string | null) => {
    console.log("New post:", { content, imageUri });
    setIsModalVisible(false);
  };

  if(isDesktop){
    return (
      <View className="flex flex-row flex-wrap justify-center">
        <View className="w-1/6  h-screen">
          <Text className="text-xl font-bold mb-6">Logo</Text>
          <Pressable 
            className="text-lg mb-4"
            onPress={()=> router.push("/")}>
              Home
          </Pressable>
          
          <Pressable 
            className="text-lg mb-4"
            onPress={()=> router.push("/message")}>
              Message
          </Pressable>

          <Pressable 
            className="text-lg mb-4"
            onPress={()=> router.push("/account")}>
              Account
          </Pressable>

          <TouchableOpacity 
            className="bg-[#1DA1F2] py-3 px-4 rounded-full w-48"
            onPress={() => setIsTweetModalVisible(true)}
          >
            <Text className="text-white text-center font-semibold text-lg">Tweet</Text>
          </TouchableOpacity>
        </View>

        <View className="w-2/5 h-screen border-x border-gray-200 mx-4">
          <Stack>
            <Stack.Screen name='index' options={{title:"Home"}} />
          </Stack>
        </View>

        <View className="w-1/6 h-screen">
          <Text className="text-lg font-semibold mb-4">Trends for you</Text>
        </View> 

        {/* Tweet Modal */}
        <TweetModal
          isVisible={isTweetModalVisible}
          onClose={() => setIsTweetModalVisible(false)}
          onPost={(content, imageUri) => {
            console.log("New post:", { content, imageUri });
            setIsTweetModalVisible(false);
          }}
        />
      </View>
    )
  }

  // Mobile: wrap the Tabs inside a view so we can overlay a floating compose button
  // and keep desktop layout above unchanged.
  return (
    <View className="flex-1">
      <Tabs screenOptions={{
        tabBarActiveTintColor: '#1DA1F2',
        tabBarStyle: {
          paddingBottom: 5,
          height: 50
        },
        tabBarLabelStyle: {
          fontSize: 12
        }
      }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
            headerLeft: () => (
              <Image
                source={{ uri: "https://randomuser.me/api/portraits/women/44.jpg" }}
                className="w-8 h-8 rounded-full ml-4"
              />
            )
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <Feather name="search" size={24} color={color} />
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Notifications',
            tabBarIcon: ({ color }) => <Feather name="bell" size={24} color={color} />
          }}
        />
        <Tabs.Screen
          name="message"
          options={{
            title: 'Messages',
            tabBarIcon: ({ color }) => <Feather name="mail" size={24} color={color} />
          }}
        />
      </Tabs>

      {/* Overlay: floating compose button + modal for mobile */}
      <View className="absolute inset-0 pointer-events-none">
        <View className="absolute bottom-4 right-4 pointer-events-auto">
          <TouchableOpacity
            className="bg-[#1DA1F2] w-14 h-14 rounded-full justify-center items-center shadow-lg"
            onPress={() => setIsModalVisible(true)}
            accessibilityLabel="Compose tweet"
          >
            <Feather name="edit-2" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <TweetModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onPost={handlePost}
        />
      </View>
    </View>
  );
}