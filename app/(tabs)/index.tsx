import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Share } from "react-native";
import "../../global.css";

const posts = [
  {
    id: 1,
    user: "Devon Lane",
    handle: "@johndue",
    text: "Tom is in a big hurry.",
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
    image: "https://picsum.photos/500/302",
    likes: "6.2K",
    comments: 61,
    shares: 12,
  },
  {
    id: 4,
    user: "Darlene Robertson",
    handle: "@johndue",
    text: "Tom is in a big hurry.",
    image: "https://picsum.photos/500/303",
    likes: "6.2K",
    comments: 61,
    shares: 12,
  },
];

export default function HomeScreen() {
  // fungsi share
  const onShare = async (post: any) => {
    try {
      await Share.share({
        message: `${post.user} (${post.handle}): ${post.text}\n${post.image}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView>
      {posts.map((post) => (
        <View key={post.id} className="border-b border-gray-200 p-4">
          {/* Header */}
          <View className="flex-row items-center mb-2">
            <Image
              source={{ uri: "https://randomuser.me/api/portraits/women/44.jpg" }}
              className="w-10 h-10 rounded-full mr-3"
            />
            <View>
              <Text className="font-bold">{post.user}</Text>
              <Text className="text-gray-500">{post.handle}</Text>
            </View>
          </View>

          {/* Content */}
          <Text className="mb-2">{post.text}</Text>
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
              <Ionicons name="chatbubble-outline" size={20} color="gray" />
              <Text className="text-gray-500">{post.comments}</Text>
            </View>
            <View className="flex-row items-center space-x-1">
              <Ionicons name="repeat" size={20} color="gray" />
              <Text className="text-gray-500">{post.shares}</Text>
            </View>
            <View className="flex-row items-center space-x-1">
              <Ionicons name="heart-outline" size={20} color="gray" />
              <Text className="text-gray-500">{post.likes}</Text>
            </View>
            {/* Tombol Share */}
            <TouchableOpacity onPress={() => onShare(post)}>
              <Feather name="share" size={20} color="gray" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
