// app/(tabs)/_layout.tsx
import { Tabs, Stack, router, usePathname } from "expo-router";
import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import "../../global.css";

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const pathname = usePathname(); // cek halaman aktif

  const NavItem = ({ icon, label, path }: { icon: any; label: string; path: string }) => {
    const isActive = pathname === path;
    return (
      <TouchableOpacity
        onPress={() => router.push(path)}
        className="flex flex-row items-center mb-6 rounded-full px-3 py-2"
        style={{
          backgroundColor: isActive ? "#E8F5FD" : "transparent", // efek hover aktif
        }}
      >
        <Ionicons
          name={icon}
          size={24}
          color={isActive ? "#1DA1F2" : "#333"}
        />
        <Text
          className="ml-3 text-lg"
          style={{ color: isActive ? "#1DA1F2" : "#333", fontWeight: isActive ? "bold" : "normal" }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isDesktop) {
    return (
      <View className="flex flex-row justify-center">
        {/* Sidebar kiri */}
        <View className="w-1/6 h-screen p-4">
          <Text className="text-2xl font-extrabold mb-8 text-sky-500">X</Text>

          <NavItem icon="home-outline" label="Home" path="/" />
          <NavItem icon="chatbubble-outline" label="Message" path="/message" />
          <NavItem icon="person-outline" label="Account" path="/account" />

          {/* Tombol Tweet */}
          <TouchableOpacity
            onPress={() => router.push("/postingan")}
            className="bg-sky-500 py-3 px-4 rounded-full mt-8"
          >
            <Text className="text-white text-center font-semibold">Tweet</Text>
          </TouchableOpacity>
        </View>

        {/* Feed Tengah */}
        <View className="w-2/5 h-screen border-x border-gray-200 mx-4">
          <Stack>
            <Stack.Screen name="index" options={{ title: "Home" }} />
          </Stack>
        </View>

        {/* Sidebar kanan */}
        <View className="w-1/6 h-screen">
          <Text className="p-4 font-semibold">Sidebar</Text>
        </View>
      </View>
    );
  }

  // === Mobile Layout (Tabs) ===
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#1DA1F2" }}>
      <Tabs.Screen
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
          )
        }}
      />
      <Tabs.Screen
        name="postingan"
        options={{
          title: "Postingan",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="create-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          title: "Message",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
