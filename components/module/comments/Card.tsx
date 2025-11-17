import { View, Text, Image } from "react-native";

interface CardDataInterface{
    id: string;
    image?: string;
    comments: string;
    created_at: string;
    email: string;
}

interface CardProps {
    data: CardDataInterface;
}

export const CommentsCard:React.FC<CardProps> = ({data }) => {

    return (
        <View key={data.id} className="border-b border-gray-200 p-4 my-1 bg-white">
            <View className="flex-row items-center mb-2">
                <Image
                    source={{ uri: "https://randomuser.me/api/portraits/women/44.jpg" }}
                    className="w-10 h-10 rounded-full mr-3"
                    />
                <View>
                    <Text className="font-bold">{data.email}</Text> 
                    <Text className="text-gray-500">{data.email}</Text>
                </View>
            </View>
            <Text className="mb-2">{data.comments}</Text>
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