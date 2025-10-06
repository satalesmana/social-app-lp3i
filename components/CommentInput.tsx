import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";

export default function CommentInput({ onSubmit }: { onSubmit: (t: string) => void }) {
  const [text, setText] = useState("");

  return (
    <View className="flex-row items-center mt-4 bg-gray-900 rounded-2xl p-2">
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Tulis komentar..."
        placeholderTextColor="#888"
        className="flex-1 text-white px-3 py-2"
      />
      <TouchableOpacity
        onPress={() => {
          if (text.trim()) {
            onSubmit(text.trim());
            setText("");
          }
        }}
        className="ml-2 bg-blue-600 px-4 py-2 rounded-xl"
      >
        <Text className="text-white font-semibold">Kirim</Text>
      </TouchableOpacity>
    </View>
  );
}
