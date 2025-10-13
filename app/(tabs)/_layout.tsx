// app/(tabs)/_layout.tsx
import { Tabs, Stack, router, usePathname } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import "../../global.css";
import PostModal from "../../components/PostModal";

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const pathname = usePathname();
  const [showPostModal, setShowPostModal] = useState(false);

  const NavItem = ({
    icon,
    label,
    path,
  }: {
    icon: any;
    label: string;
    path: string;
  }) => {
    const isActive = pathname === path;

    return (
      <TouchableOpacity
        onPress={() => router.push(path)}
        className="flex flex-row items-center mb-6 rounded-full px-3 py-2"
        style={{
          backgroundColor: isActive ? "#E8F5FD" : "transparent",
        }}
      >
        <Ionicons name={icon} size={24} color={isActive ? "#1DA1F2" : "#333"} />
        <Text
          className="ml-3 text-lg"
          style={{
            color: isActive ? "#1DA1F2" : "#333",
            fontWeight: isActive ? "bold" : "normal",
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isDesktop) {
    return (
      <View className="flex flex-row justify-center bg-white">
        {/* Sidebar Kiri */}
        <View className="w-1/6 h-screen p-4">
          <Ionicons
            name="logo-twitter"
            size={32}
            color="#1DA1F2"
            style={{ marginBottom: 32 }}
          />

          <NavItem icon="home-outline" label="Home" path="/" />
          <NavItem icon="chatbubble-outline" label="Message" path="/message" />
          <NavItem icon="person-outline" label="Account" path="/account" />

          <TouchableOpacity
            onPress={() => setShowPostModal(true)}
            className="bg-sky-500 py-3 px-4 rounded-full mt-8"
          >
            <Text className="text-white text-center font-semibold">Tweet</Text>
          </TouchableOpacity>

          <PostModal
            visible={showPostModal}
            onClose={() => setShowPostModal(false)}
          />
        </View>

        {/* Feed Tengah */}
        <View className="w-2/5 h-screen border-x border-gray-200 mx-4">
          <Stack>
            <Stack.Screen name="index" options={{ title: "Home" }} />
          </Stack>
        </View>

        {/* Sidebar Kanan */}
        <View
          className="h-screen"
          style={{
            width: "30%", // 🔹 Lebarkan sedikit agar tidak kepotong
            paddingHorizontal: 24,
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {/* Search Bar */}
            <View
              style={{
                backgroundColor: "#EFF3F4",
                borderRadius: 50,
                paddingHorizontal: 15,
                paddingVertical: 10,
                marginBottom: 20,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Ionicons name="search" size={18} color="#657786" />
              <Text style={{ color: "#657786", marginLeft: 8 }}>
                Search Twitter
              </Text>
            </View>

            {/* What's Happening */}
            <View
              style={{
                backgroundColor: "#F7F9F9",
                borderRadius: 20,
                padding: 15,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  marginBottom: 10,
                }}
              >
                What’s happening
              </Text>

              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: "#536471", fontSize: 13 }}>
                  COVID19 · Last night
                </Text>
                <Text style={{ fontWeight: "600", fontSize: 14 }}>
                  England’s Chief Medical Officer says the UK is at its most
                  dangerous time of the pandemic
                </Text>
                <Text style={{ color: "#1DA1F2", fontSize: 13 }}>#covid19</Text>
              </View>

              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: "#536471", fontSize: 13 }}>
                  US news · 4h ago
                </Text>
                <Text style={{ fontWeight: "600", fontSize: 14 }}>
                  Parler may go offline following suspensions by Amazon, Apple
                  and Google
                </Text>
                <Text style={{ color: "#1DA1F2", fontSize: 13 }}>#trump</Text>
              </View>

              <View>
                <Text style={{ color: "#536471", fontSize: 13 }}>
                  India · 1h ago
                </Text>
                <Text style={{ fontWeight: "600", fontSize: 14 }}>
                  India vs Australia: India held on to earn a draw on Day 5 in
                  Sydney Test
                </Text>
                <Text style={{ color: "#1DA1F2", fontSize: 13 }}>#sport</Text>
              </View>

              <Text
                style={{
                  color: "#1DA1F2",
                  marginTop: 12,
                  fontSize: 13,
                  fontWeight: "500",
                }}
              >
                Show more
              </Text>
            </View>

            {/* 👥 Who to follow */}
            <View
              style={{
                backgroundColor: "#F7F9F9",
                borderRadius: 20,
                paddingVertical: 10,
                marginBottom: 20,
                paddingHorizontal: 15,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  marginBottom: 10,
                }}
              >
                Who to follow
              </Text>

              {[
                {
                  name: "Bessie Cooper",
                  username: "@alessandroveronazi",
                  avatar:
                    "https://randomuser.me/api/portraits/women/44.jpg",
                },
                {
                  name: "Jenny Wilson",
                  username: "@gabrielcantarin",
                  avatar: "https://randomuser.me/api/portraits/men/11.jpg",
                },
              ].map((user, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <Image
                      source={{ uri: user.avatar }}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 999,
                      }}
                    />
                    <View
                      style={{
                        marginLeft: 10,
                        flexShrink: 1,
                        flexWrap: "wrap",
                        width: "70%", // 🔹 Lebarkan area teks username
                      }}
                    >
                      <Text style={{ fontWeight: "600", fontSize: 15 }}>
                        {user.name}
                      </Text>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{
                          color: "#6b7280",
                          fontSize: 13,
                          flexShrink: 1,
                        }}
                      >
                        {user.username}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={{
                      backgroundColor: "#000",
                      borderRadius: 999,
                      paddingHorizontal: 18,
                      paddingVertical: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
                      Follow
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity>
                <Text
                  style={{
                    color: "#1DA1F2",
                    fontSize: 13,
                    marginTop: 4,
                    fontWeight: "500",
                  }}
                >
                  Show more
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
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
