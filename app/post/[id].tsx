import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getCommentsByPostId, addComment } from "../../lib/api/comment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArrowLeft } from "lucide-react-native";

export default function PostDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const u = await AsyncStorage.getItem("user_session");
      setUser(u ? JSON.parse(u) : { name: "Guest" });
    };
    const loadComments = async () => {
      const c = await getCommentsByPostId(id as string);
      setComments(c);
    };
    loadUser();
    loadComments();
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const c = await addComment(id as string, newComment, user);
    setComments((prev) => [...prev, c]);
    setNewComment("");
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header dengan tombol back */}
      <View className="flex-row items-center px-4 pt-12 pb-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-gray-800">Komentar</Text>
      </View>

      <ScrollView className="p-4 flex-1">
        {/* Konten postingan */}
        {post ? (
          <>
            {post.image_url && (
              <Image
                source={{ uri: post.image_url }}
                className="w-full h-56 rounded-xl mb-4"
              />
            )}
            <Text className="text-2xl font-bold mb-2">{post.title}</Text>
            <Text className="text-gray-700 mb-6">{post.content}</Text>
          </>
        ) : (
          <View className="py-10 items-center">
            <Text className="text-gray-500">Memuat postingan...</Text>
          </View>
        )}

        {/* Komentar */}
        <View className="mt-4 border-t border-gray-300 pt-3">
          <Text className="text-lg font-semibold mb-2">Komentar</Text>

          {comments.length > 0 ? (
            comments.map((c) => (
              <View key={c.id} className="mb-3 bg-gray-100 p-3 rounded-xl">
                <Text className="font-bold text-blue-700">
                  {c.user_name || "Guest"}
                </Text>
                <Text>{c.content}</Text>
                <Text className="text-xs text-gray-500 mt-1">
                  {new Date(c.created_at).toLocaleString()}
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-gray-500 text-center mt-3">
              Belum ada komentar
            </Text>
          )}

          {/* Input komentar */}
          <View className="mt-4">
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Tulis komentar..."
              className="border border-gray-300 rounded-full px-4 py-2 mb-2"
            />
            <TouchableOpacity
              onPress={handleAddComment}
              className="bg-blue-500 rounded-full py-2"
            >
              <Text className="text-center text-white font-semibold">
                KIRIM
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
