import { View, Text, Image, ScrollView} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import "../../global.css"
import { supabase, uploadImage } from "../lib/supabase";


const posts = [
  {
    id: 1,
    user: "Japan View",
    handle: "@JpnView",
    text: "Beautiful sunset with train passing by in japan.",
    image: "https://miyttagoybwpulrlymas.supabase.co/storage/v1/object/sign/social-apps/japan%20train.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84ZDZlNTJiYy1mMDc4LTRkOTQtOTYyNi03NjFjYWRmZTc0ZWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzb2NpYWwtYXBwcy9qYXBhbiB0cmFpbi5qcGciLCJpYXQiOjE3NTk1NzA4NDcsImV4cCI6MTc5MTEwNjg0N30.0JaYx2Svi_8aDKwThCNN1k2eZx7nKvcFLFzfptbQ0A8",
    likes: "6.2K",
    comments: 61,
    shares: 12,
  },
  {
    id: 2,
    user: "TrainAntusias",
    handle: "@Trainanstusias",
    text: "Electric locomotive by Alstom France.",
    image: "https://miyttagoybwpulrlymas.supabase.co/storage/v1/object/sign/social-apps/Alstom%20PRIMA%20II.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84ZDZlNTJiYy1mMDc4LTRkOTQtOTYyNi03NjFjYWRmZTc0ZWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzb2NpYWwtYXBwcy9BbHN0b20gUFJJTUEgSUkuanBnIiwiaWF0IjoxNzU5NTcxMzg2LCJleHAiOjE3NjIxNjMzODZ9.mjKSFX3wMbD4yDzY1k1tJI47k02XyvE9L9ZNh74lq80",
    likes: "5.2K",
    comments: 51,
    shares: 52,
  },
  {
    id: 3,
    user: "Seputar Kereta",
    handle: "@seputarkereta22",
    text: "Train assidance in Bintaro Indonesia 2013 .",
    image: "https://miyttagoybwpulrlymas.supabase.co/storage/v1/object/sign/social-apps/bintaro%20I.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84ZDZlNTJiYy1mMDc4LTRkOTQtOTYyNi03NjFjYWRmZTc0ZWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzb2NpYWwtYXBwcy9iaW50YXJvIEkuanBnIiwiaWF0IjoxNzU5NTcxNjA2LCJleHAiOjE3OTExMDc2MDZ9.j20Bk-o3WJ39JFd_Bc6wrOZatJR6kCjV9QZZNrNWFOY",
    likes: "9.2K",
    comments: 101,
    shares: 97,
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

export default function HomeScreen(){
    return(
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
    )
}