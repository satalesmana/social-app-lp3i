import { View, Text, Image, Pressable} from "react-native";

interface CardDataInterface{
    image?: string;
    id: string;
    handle: string;
    createdby: string;
    text: string;
}

interface CardProps {
    data: CardDataInterface;
}

export const PostDetailCard:React.FC<CardProps> = ({data }) => {

    return (
        <View key={data.id} className="border-b border-gray-200 p-4 my-1 bg-white">
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
        </View>
    )
}