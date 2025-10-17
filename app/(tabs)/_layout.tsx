import { Tabs, Stack, router } from "expo-router";
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import "../../global.css";
import { useTweetModal } from "../../context/TweetModalContext";
import { AntDesign, Feather, Octicons } from "@expo/vector-icons";
import HomeButton from "../../components/HomeButton";
import TweetModal from "../../components/TweetModal";
import { useState } from "react";

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { openModal, isOpen, closeModal} = useTweetModal();
  const [showTweetButton, setShowTweetButton] = useState(true);

  const handleCloseModal = () => {
    setShowTweetButton(true);
    closeModal();
  };

  if (isDesktop) {
    return (
      <View className="flex flex-row flex-wrap justify-center">
        <View className="w-1/6 h-screen p-4">
          <View className="mb-5">
            <AntDesign name="twitter" size={24} color="#2563eb" />
          </View>

          <HomeButton onPress={() => router.push("/")} iconName="home" label="Home"/>
          <HomeButton onPress={() => router.push("/message")} iconName="mail" label="Message"/>
          <HomeButton onPress={() => router.push("/account")} iconName="person" label="Profile"/>

          <TouchableOpacity
            className="bg-sky-500 py-2 px-4 rounded-md"
            onPress={openModal}
          >
            <Text className="text-white text-center">Tweet</Text>
          </TouchableOpacity>
          
        </View>

        <View className="w-2/5 h-screen border-x border-gray-200 mx-4">
          <Stack>
            <Stack.Screen name="index" options={{ title: "Home" }} />
          </Stack>
        </View>

        <View className="w-1/6 h-screen">
          <Text>asdf</Text>
        </View>

        <TweetModal handleCloseModal={handleCloseModal}
        />
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Tabs Section */}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "blue",
          headerShown: false,
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="message" options={{ title: "Message" }} />
        <Tabs.Screen name="account" options={{ title: "Account" }} />
      </Tabs>
       
      
    </View>
  );
}
