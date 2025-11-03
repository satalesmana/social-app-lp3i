import { View, Text } from "react-native";
import { useLocalSearchParams } from 'expo-router';

export default function CommentsPage(){
    const { id } = useLocalSearchParams();

    return(
        <View>
            <Text>asdf {id} </Text>
        </View>
    )
}