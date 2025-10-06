import React, { createContext, useState, useContext } from "react";
import { Tabs, Stack, router } from "expo-router";
import { View, Text, Pressable, TouchableOpacity, useWindowDimensions } from "react-native";
import "../../global.css";

// Context untuk Dark Mode
type ThemeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {isDesktop ? (
        <View
          className="flex flex-row flex-wrap justify-center"
          style={{ backgroundColor: darkMode ? "#111" : "#fff" }}
        >
          {/* Sidebar */}
          <View
            className="w-1/6 h-screen p-4"
            style={{ backgroundColor: darkMode ? "#222" : "#f9f9f9" }}
          >
            <Text
              className="text-xl font-bold mb-6"
              style={{ color: darkMode ? "#fff" : "#000" }}
            >
              Logo
            </Text>

            <Pressable className="text-lg mb-4" onPress={() => router.push("/")}>
              <Text style={{ color: darkMode ? "#fff" : "#000" }}>Home</Text>
            </Pressable>

            <Pressable
              className="text-lg mb-4"
              onPress={() => router.push("/message")}
            >
              <Text style={{ color: darkMode ? "#fff" : "#000" }}>Message</Text>
            </Pressable>

            <Pressable
              className="text-lg mb-4"
              onPress={() => router.push("/account")}
            >
              <Text style={{ color: darkMode ? "#fff" : "#000" }}>Account</Text>
            </Pressable>

            <TouchableOpacity className="bg-sky-500 py-2 px-4 rounded-md">
              <Text className="text-white text-center">Tweet</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View
            className="w-2/5 h-screen border-x mx-4"
            style={{ borderColor: darkMode ? "#444" : "#ccc" }}
          >
            <Stack>
              <Stack.Screen name="index" options={{ title: "Home" }} />
            </Stack>
          </View>

          {/* Right Section */}
          <View
            className="w-1/6 h-screen"
            style={{ backgroundColor: darkMode ? "#222" : "#f9f9f9" }}
          >
            <Text style={{ color: darkMode ? "#fff" : "#000" }}>Sidebar</Text>
          </View>
        </View>
      ) : (
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: "blue",
            tabBarStyle: {
              backgroundColor: darkMode ? "#222" : "#fff",
            },
            tabBarLabelStyle: { color: darkMode ? "#fff" : "#000" },
          }}
        >
          <Tabs.Screen name="index" options={{ title: "Home" }} />
          <Tabs.Screen name="message" options={{ title: "Message" }} />
          <Tabs.Screen
            name="account"
            options={{
              title: "Account",
              headerShown: false,
            }}
          />
        </Tabs>
      )}
    </ThemeContext.Provider>
  );
}
