import { useState } from 'react';
import { Tabs, Stack, router } from 'expo-router';
import { View, Text, Pressable, TouchableOpacity, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FormInputPost } from '../../components/module/post/FormInput';
import "../../global.css"

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const [isFormVisible, setFormVisible] = useState(false);
  const isDesktop = width >= 768; // switch layout for tablet/desktop

  if(isDesktop){
    return (
      <View className="flex flex-row flex-wrap justify-center">
        <FormInputPost 
          visible={isFormVisible} 
          onClose={() => setFormVisible(false)} 
          onSubmit={() => {}} />

        <View className="w-1/6  h-screen">
          <Text className="text-xl font-bold mb-6">Logo</Text>
          <Pressable 
            className="text-lg mb-4"
            onPress={()=> router.push("/(home)")}>
              Home
          </Pressable>
          
          <Pressable 
            className="text-lg mb-4"
            onPress={()=> router.push("/message")}>
              Message
          </Pressable>

          <Pressable 
            className="text-lg mb-4"
            onPress={()=> router.push("/(account)")}>
              Account
          </Pressable>

          <TouchableOpacity 
            onPress={() => setFormVisible(true)}
            className="bg-sky-500 py-2 px-4 rounded-md">
              <Text className="text-white text-center">Tweet</Text>
          </TouchableOpacity>
        </View>

        <View className="w-2/5 h-screen  border-x border-gray-200 mx-4">
          <Stack>
            <Stack.Screen name='(home)' options={{headerShown:false }} />
            <Stack.Screen name='message' options={{title:"Message"}}  />
            <Stack.Screen name='(account)' options={{title:"Account", headerShown:false}} />
          </Stack>
        </View>

        <View className="w-1/6  h-scree">
          <Text>asdf</Text>
        </View> 
      </View>
    )
  }

  return (
    <Tabs>
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          title: 'Message',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(account)"
        options={{
          title: 'Account',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}