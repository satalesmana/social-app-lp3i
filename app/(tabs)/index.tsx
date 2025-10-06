import { View, Text, Image, ScrollView } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useTheme } from "./_layout"; // ambil context dark mode
import "../../global.css";

const posts = [
  {
    id: 1,
    user: "Devon Lane",
    handle: "@johndue",
    text: "Gunung Rinjani.",
    image: "https://picsum.photos/500/300",
    likes: "6.2K",
    comments: 61,
    shares: 12,
  },
  {
    id: 2,
    user: "Darlene Robertson",
    handle: "@johndue",
    text: "Tom is in a big hurry.",
    image: "https://picsum.photos/500/301",
    likes: "6.2K",
    comments: 61,
    shares: 12,
  },
  {
    id: 3,
    user: "Darlene Robertson",
    handle: "@johndue",
    text: "Tom is in a big hurry.",
    image: "https://picsum.photos/500/301",
    likes: "6.2K",
    comments: 61,
    shares: 12,
  },
  {
    id: 4,
    user: "Darlene Robertson",
    handle: "@johndue",
    text: "Tom is in a big hurry.",
    image: "https://picsum.photos/500/301",
    likes: "6.2K",
    comments: 61,
    shares: 12,
  },
];

export default function HomeScreen() {
  const { darkMode } = useTheme();

  return (
    <ScrollView
      style={{ backgroundColor: darkMode ? "#111" : "#fff" }}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      {posts.map((post) => (
        <View
          key={post.id}
          className="p-4"
          style={{
            borderBottomWidth: 1,
            borderColor: darkMode ? "#444" : "#e5e7eb", // border-gray-200
          }}
        >
          {/* Header */}
          <View className="flex-row items-center mb-2">
            <Image
              source={{ uri: "https://randomuser.me/api/portraits/women/44.jpg" }}
              className="w-10 h-10 rounded-full mr-3"
            />
            <View>
              <Text
                className="font-bold"
                style={{ color: darkMode ? "#fff" : "#000" }}
              >
                {post.user}
              </Text>
              <Text style={{ color: darkMode ? "#aaa" : "#6b7280" }}>
                {post.handle}
              </Text>
            </View>
          </View>

          {/* Content */}
          <Text
            className="mb-2"
            style={{ color: darkMode ? "#ddd" : "#000" }}
          >
            {post.text}
          </Text>
          {post.image && (
            <Image
              source={{ uri: post.image }}
              className="w-full h-48 rounded-xl mb-2"
              resizeMode="cover"
            />
          )}

          {/* Actions */}
          <View className="flex-row justify-between mt-2">
            <View className="flex-row items-center space-x-1">
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color={darkMode ? "#aaa" : "gray"}
              />
              <Text style={{ color: darkMode ? "#aaa" : "gray" }}>
                {post.comments}
              </Text>
            </View>
            <View className="flex-row items-center space-x-1">
              <Ionicons
                name="repeat"
                size={20}
                color={darkMode ? "#aaa" : "gray"}
              />
              <Text style={{ color: darkMode ? "#aaa" : "gray" }}>
                {post.shares}
              </Text>
            </View>
            <View className="flex-row items-center space-x-1">
              <Ionicons
                name="heart-outline"
                size={20}
                color={darkMode ? "#aaa" : "gray"}
              />
              <Text style={{ color: darkMode ? "#aaa" : "gray" }}>
                {post.likes}
              </Text>
            </View>
            <Feather name="share" size={20} color={darkMode ? "#aaa" : "gray"} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
