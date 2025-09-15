import { Tabs, Stack, router } from 'expo-router';
import { View, Text, Pressable, TouchableOpacity, useWindowDimensions } from "react-native";
import "../../global.css"

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768; // switch layout for tablet/desktop

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

          <TouchableOpacity className="bg-sky-500 py-2 px-4 rounded-md">
            <Text className="text-white text-center">Tweet</Text>
          </TouchableOpacity>
        </View>

        <View className="w-2/5 h-screen  border-x border-gray-200 mx-4">
          <Stack>
            <Stack.Screen name='index' options={{title:"Home"}} />
          </Stack>
        </View>

        <View className="w-1/6  h-scree">
          <Text>asdf</Text>
        </View> 
      </View>
    )
  }

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
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
        }}
      />
    </Tabs>
  );
}