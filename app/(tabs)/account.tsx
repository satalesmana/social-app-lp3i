import { FontAwesome5, Feather } from "@expo/vector-icons";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Switch,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { router } from "expo-router";
import { useTheme } from "./_layout";

export default function AccountPage() {
  const { darkMode, toggleDarkMode } = useTheme();

  const onSignOut = async () => {
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (!error) {
      router.replace("login");
    }
  };

  const onEditProfile = () => {
    router.push("edit-profile");
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: darkMode ? "#1a1a1a" : "#fef6e4",
      }}
    >
      {/* Header Kartun */}
      <View
        className="rounded-b-3xl pb-16 items-center"
        style={{
          backgroundColor: darkMode ? "#333" : "#ff8fab",
          borderBottomWidth: 5,
          borderColor: darkMode ? "#555" : "#ffc6c7",
        }}
      >
        <View
          style={{
            backgroundColor: darkMode ? "#444" : "#fff",
            padding: 6,
            borderRadius: 999,
            marginTop: 20,
            elevation: 6,
          }}
        >
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=5" }}
            className="w-24 h-24 rounded-full border-4"
            style={{
              borderColor: darkMode ? "#ffb347" : "#ffcc00",
            }}
          />
        </View>
        <Text
          className="text-xl font-bold mt-3"
          style={{ color: darkMode ? "#ffe066" : "#fff" }}
        >
          Iqbal 🚀
        </Text>
        <Text style={{ color: darkMode ? "#ccc" : "#fff", fontSize: 12 }}>
          nickedward@gmail.com
        </Text>
      </View>

      {/* Card Section Kartun */}
      <View
        className="mx-5 -mt-10 rounded-3xl p-6 shadow-md"
        style={{
          backgroundColor: darkMode ? "#2a2a2a" : "#fff",
          borderWidth: 3,
          borderColor: darkMode ? "#666" : "#ffb347",
        }}
      >
        {/* Toggle Dark Mode */}
        <View className="flex-row justify-between items-center mb-6">
          <Text style={{ color: darkMode ? "#eee" : "#333", fontWeight: "600" }}>
            🌙 Dark Mode
          </Text>
          <Switch value={darkMode} onValueChange={toggleDarkMode} />
        </View>

        {/* Buttons Row Kartun */}
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity className="items-center">
            <View
              className="p-5 rounded-2xl"
              style={{
                backgroundColor: darkMode ? "#444" : "#ffd6ff",
                borderWidth: 2,
                borderColor: "#ff85a1",
              }}
            >
              <FontAwesome5 name="wallet" size={22} color="#ff5d8f" />
            </View>
            <Text style={{ color: darkMode ? "#fff" : "#333" }}>Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center">
            <View
              className="p-5 rounded-2xl"
              style={{
                backgroundColor: darkMode ? "#444" : "#caffbf",
                borderWidth: 2,
                borderColor: "#06d6a0",
              }}
            >
              <Feather name="settings" size={22} color="#06d6a0" />
            </View>
            <Text style={{ color: darkMode ? "#fff" : "#333" }}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center">
            <View
              className="p-5 rounded-2xl"
              style={{
                backgroundColor: darkMode ? "#444" : "#bdb2ff",
                borderWidth: 2,
                borderColor: "#6c63ff",
              }}
            >
              <Feather name="bell" size={22} color="#6c63ff" />
            </View>
            <Text style={{ color: darkMode ? "#fff" : "#333" }}>
              Notification
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Section Kartun */}
        <View className="space-y-4">
          <View className="flex-row justify-between">
            <Text style={{ color: darkMode ? "#aaa" : "#555" }}>Name</Text>
            <Text style={{ color: "#ff85a1", fontWeight: "700" }}>
              Sata Lesmana
            </Text>
          </View>

          <View className="flex-row justify-between">
            <Text style={{ color: darkMode ? "#aaa" : "#555" }}>E-mail</Text>
            <Text style={{ color: darkMode ? "#fff" : "#000" }}>
              demo@gmail.com
            </Text>
          </View>

          <View className="flex-row justify-between">
            <Text style={{ color: darkMode ? "#aaa" : "#555" }}>Gender</Text>
            <Text style={{ color: darkMode ? "#fff" : "#000" }}>Male</Text>
          </View>

          <View className="flex-row justify-between">
            <Text style={{ color: darkMode ? "#aaa" : "#555" }}>Address</Text>
            <Text
              className="w-40 text-right"
              style={{ color: darkMode ? "#fff" : "#000" }}
            >
              Jl. demo ts
            </Text>
          </View>
        </View>
      </View>

      {/* Buttons Kartun */}
      <View className="mx-5 mt-6 space-y-4">
        <Pressable
          onPress={onEditProfile}
          className="py-3 flex items-center justify-center rounded-2xl"
          style={{
            backgroundColor: "blue",
            borderWidth: 3,
            borderColor: "white",
          }}
        >
          <Text className="text-white font-bold">🎨 Edit Profile</Text>
        </Pressable>

        <Pressable
          onPress={onSignOut}
          className="py-3 flex items-center justify-center rounded-2xl"
          style={{
            backgroundColor: "#ff595e",
            borderWidth: 3,
            borderColor: "#d62828",
          }}
        >
          <Text className="text-white font-bold">🚪 Logout</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
