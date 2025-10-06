import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import "../../global.css";
import { useState } from "react";
import { ReportModal } from "../../components/global/ReportModal";
import { HiddenPostPlaceholder } from "../../components/global/HiddenPostPlaceholder";

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

export default function HomeScreen() {
  // State dan Logika tetap berada di sini
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [hiddenPostIds, setHiddenPostIds] = useState([]);

  const handleOpenModal = (post) => {
    setSelectedPost(post);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedPost(null);
  };

  const handleReportSubmit = (reason) => {
    if (!selectedPost) return;
    Alert.alert(
      "Laporan Terkirim",
      `Postingan dari ${selectedPost.user} dilaporkan dengan alasan: ${reason}`
    );
    setHiddenPostIds((prevHiddenIds) => [...prevHiddenIds, selectedPost.id]);
    handleCloseModal();
  };

  const handleUndoHide = (postId) => {
    setHiddenPostIds((prevHiddenIds) =>
      prevHiddenIds.filter((id) => id !== postId)
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {posts.map((post) => {
          if (hiddenPostIds.includes(post.id)) {
            // Menggunakan komponen yang diimpor
            return (
              <HiddenPostPlaceholder
                key={post.id}
                onUndo={() => handleUndoHide(post.id)}
              />
            );
          }

          return (
            <View key={post.id} className="border-b border-gray-200 p-4">
              {/* Tampilan post seperti biasa */}
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center">
                  <Image
                    source={{
                      uri: "https://randomuser.me/api/portraits/women/44.jpg",
                    }}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <View>
                    <Text className="font-bold">{post.user}</Text>
                    <Text className="text-gray-500">{post.handle}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleOpenModal(post)}>
                  <Feather name="more-horizontal" size={24} color="gray" />
                </TouchableOpacity>
              </View>
              {/* ... sisa JSX postingan */}
              <Text className="mb-2">{post.text}</Text>
              {post.image && (
                <Image
                  source={{ uri: post.image }}
                  className="w-full h-48 rounded-xl mb-2"
                  resizeMode="cover"
                />
              )}
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
          );
        })}
      </ScrollView>

      {/* Menggunakan komponen yang diimpor */}
      <ReportModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSubmit={handleReportSubmit}
      />
    </View>
  );
}
