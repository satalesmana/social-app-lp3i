import { Tabs, Stack, router } from 'expo-router';
import { View, Text, Pressable, TouchableOpacity, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import "../../global.css";

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768; // switch layout for tablet/desktop

  if (isDesktop) {
    return (
      <View className="flex flex-row flex-wrap justify-center">
        {/* LEFT SIDEBAR */}
        <View className="w-1/6 h-screen p-4 border-r border-gray-200">
          <Text className="text-xl font-bold mb-6">Logo</Text>

          <Pressable className="text-lg mb-4" onPress={() => router.push("/")}>
            Home
          </Pressable>

          <Pressable className="text-lg mb-4" onPress={() => router.push("/message")}>
            Message
          </Pressable>

          <Pressable className="text-lg mb-4" onPress={() => router.push("/account")}>
            Account
          </Pressable>

          <TouchableOpacity className="bg-sky-500 py-2 px-4 rounded-md mt-4">
            <Text className="text-white text-center">Tweet</Text>
          </TouchableOpacity>
        </View>

        {/* MAIN CONTENT */}
        <View className="w-2/5 h-screen border-x border-gray-200 mx-4">
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                title: "Home",
                headerRight: () => (
                  <TouchableOpacity
                    onPress={() => router.push("/(tabs)/saved")}
                    style={{ marginRight: 12 }}
                  >
                    <Ionicons name="bookmark-outline" size={24} color="#2563eb" />
                  </TouchableOpacity>
                ),
              }}
            />
            <Stack.Screen
              name="saved"
              options={{ title: "Saved Posts" }}
            />
          </Stack>
        </View>

        {/* RIGHT SIDEBAR */}
        <View className="w-1/6 h-screen">
          <Text>Right Side</Text>
        </View>
      </View>
    );
  }

  // MOBILE VERSION
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/saved")}
              style={{ marginRight: 12 }}
            >
              <Ionicons name="bookmark-outline" size={24} color="#2563eb" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen name="message" options={{ title: 'Message' }} />
      <Tabs.Screen name="account" options={{ title: 'Account', headerShown: false }} />
    </Tabs>
  );
}
