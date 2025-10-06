import React from "react";
import { View, Text, Image } from "react-native";

export default function CommentList({ comments = [] }: { comments: any[] }) {
  if (!comments || comments.length === 0) {
    return <Text className="text-gray-400 mt-2 text-center">Belum ada komentar</Text>;
  }

  return (
    <View className="mt-4">
      {comments.map((c) => (
        <View
          key={c.id}
          className="flex-row items-start mb-3 bg-gray-900 p-3 rounded-2xl border border-gray-800"
        >
          <Image
            source={{
              uri: "https://randomuser.me/api/portraits/men/32.jpg",
            }}
            className="w-10 h-10 rounded-full mr-3"
          />
          <View className="flex-1">
            <Text className="text-white font-semibold">
              {c.profiles?.username || "Anonim"}
            </Text>
            <Text className="text-gray-300 mt-1">{c.content}</Text>
            <Text className="text-gray-500 text-xs mt-1">
              {new Date(c.created_at).toLocaleString()}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
