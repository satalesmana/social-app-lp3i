import { View, Text, Image, Pressable} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

interface CardDataInterface{
    image?: string;
    id: string;
    handle: string;
    createdby: string;
    text: string;
    comments: Array<string>
    shares: Array<string>
    likes: Array<string>
}

interface CardProps {
    data: CardDataInterface;
    onlikeAction: (value:string)=> void
}

export const PostCard:React.FC<CardProps> = ({data, onlikeAction}) => {
    return (
        <View key={data.id} className="border-b border-gray-200 p-4">
            <View className="flex-row items-center mb-2">
                <Image
                    source={{ uri: "https://randomuser.me/api/portraits/women/44.jpg" }}
                    className="w-10 h-10 rounded-full mr-3"
                    />
                <View>
                    <Text className="font-bold">{data.createdby}</Text>
                    <Text className="text-gray-500">{data.handle}</Text>
                </View>
            </View>
            <Text className="mb-2">{data.text}</Text>
            {data.image && (
                <Image
                source={{ uri: data.image }}
                className="w-full h-48 rounded-xl mb-2"
                resizeMode="cover"
                />
            )}

            <View className="flex-row justify-between mt-2">
                <View className="flex-row items-center space-x-1 gap-2">
                    <Ionicons name="chatbubble-outline" size={20} color="gray" />
                    <Text className="text-gray-500">{data.comments.length}</Text>
                </View>

                <View className="flex-row items-center space-x-1 gap-2">
                    <Ionicons name="repeat" size={20} color="gray" />
                    <Text className="text-gray-500">{data.shares.length}</Text>
                </View>

                <View className="flex-row items-center space-x-1 gap-2">
                    <Pressable onPress={()=>onlikeAction(data.id)}>
                        <Ionicons name="heart-outline" size={20} color="gray" />
                        <Ionicons name="heart" size={20} color="red" />
                    </Pressable>
                    <Text className="text-gray-500">{data.likes.length}</Text>
                </View>
            </View>
        </View>
    )
};