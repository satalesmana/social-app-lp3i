// FeedPage.tsx
import React from "react";
import { View, Text, Image, ScrollView, TextInput, TouchableOpacity, useWindowDimensions } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import "./global.css"

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

export default function FeedPage() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768; // switch layout for tablet/desktop

  return (
    <View className="flex-1 md:items-center md:justify-center">
        <View className="flex-1 bg-white max-w-screen-lg">
          <View className="flex-1 flex-row">
            {/* LEFT SIDEBAR (Desktop Only) */}
            {isDesktop && (
              <View className="w-1/5 border-r border-gray-200 p-4">
                <Text className="text-xl font-bold mb-6">Logo</Text>
                <Text className="text-lg mb-4">Home</Text>
                <Text className="text-lg mb-4">Explore</Text>
                <Text className="text-lg mb-4">Notifications</Text>
                <Text className="text-lg mb-4">Messages</Text>
                <TouchableOpacity className="bg-sky-500 py-2 px-4 rounded-full">
                  <Text className="text-white text-center">Tweet</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* MAIN FEED */}
            <View className={`${isDesktop ? "w-3/5" : "flex-1"} border-r border-gray-200`}>
              {/* What's happening input */}
              <View className="flex-row items-center p-4 border-b border-gray-200">
                <Image
                  source={{ uri: "https://randomuser.me/api/portraits/men/1.jpg" }}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <TextInput
                  placeholder="What's happening?"
                  className="flex-1 text-base"
                  multiline
                />
              </View>

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
                      <Feather name="share" size={20} color="gray" />
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* RIGHT SIDEBAR (Desktop Only) */}
            {isDesktop && (
              <View className="w-1/5 p-4">
                <Text className="font-bold mb-4">What's happening</Text>
                <Text className="text-gray-600 mb-2">COVID19 · Last night</Text>
                <Text className="text-sm mb-4">
                  England’s Chief Medical Officer says the UK is at the most dangerous time.
                </Text>

                <Text className="font-bold mb-4">Who to follow</Text>
                <View className="mb-3">
                  <Text>Bessie Cooper</Text>
                  <TouchableOpacity className="bg-sky-500 px-3 py-1 rounded-full mt-1">
                    <Text className="text-white text-center">Follow</Text>
                  </TouchableOpacity>
                </View>
                <View>
                  <Text>Jenny Wilson</Text>
                  <TouchableOpacity className="bg-sky-500 px-3 py-1 rounded-full mt-1">
                    <Text className="text-white text-center">Follow</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
    </View>
  );
}
