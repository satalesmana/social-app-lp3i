import { Tabs, Stack, router } from 'expo-router';
import { View, Text, Pressable, TouchableOpacity, useWindowDimensions } from "react-native";
import "../../global.css"

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768; // switch layout for tablet/desktop

  if(isDesktop){
    return (
      <View className="flex flex-row flex-wrap justify-center">
        <View className="w-1/6 h-screen">
          <Text className="text-xl font-bold mb-6">Logo</Text>

          {/* --- PERBAIKAN DI SINI --- */}
          <Pressable onPress={()=> router.push("/")}>
            <Text className="text-lg mb-4">Home</Text>
          </Pressable>
          
          <Pressable onPress={()=> router.push("/message")}>
            <Text className="text-lg mb-4">Message</Text>
          </Pressable>

          <Pressable onPress={()=> router.push("/account")}>
            <Text className="text-lg mb-4">Account</Text>
          </Pressable>
          {/* --- AKHIR PERBAIKAN --- */}

          <TouchableOpacity className="bg-sky-500 py-2 px-4 rounded-md">
            <Text className="text-white text-center">Tweet</Text>
          </TouchableOpacity>
        </View>

        <View className="w-2/5 h-screen border-x border-gray-200 mx-4">
          <Stack>
            {/* Pastikan semua screen di dalam stack didefinisikan */}
            <Stack.Screen name='index' options={{headerShown: false}} />
            <Stack.Screen name='message' options={{headerShown: false}} />
            <Stack.Screen name='account' options={{headerShown: false}} />
          </Stack>
        </View>

        <View className="w-1/6 h-scree">
          <Text>asdf</Text>
        </View> 
      </View>
    )
  }

  // Kode untuk mobile (Tabs) sudah benar dan tidak perlu diubah
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
          headerShown: false
        }}
      />
    </Tabs>
  );
}