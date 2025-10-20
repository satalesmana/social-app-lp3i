import { View, Text } from 'react-native';
interface CardDataInterface{
    image?: string;
    message?: string;
}

interface CardProps {
    data: CardDataInterface;
}

export const FormInput:React.FC<CardProps> = ({data}) => {
    return (
        <View>
            <Text>Form Input</Text>
        </View>
    )
};