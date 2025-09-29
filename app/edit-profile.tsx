import { View, Text, Pressable, TouchableOpacity, useWindowDimensions } from "react-native";
import { useState } from "react"
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../lib/supabase';


export default function EditAccount(){
    const [image, setImage] = useState<string | null>(null);
    const [imageName, setImageName] = useState<string | null>(null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0].base64 as string);
            setImageName(result.assets[0].fileName as string);
        }
    }

    const onSave=()=>{
        uploadImage(image as string, imageName as string)
    }

    return(
        <View>
            <Pressable onPress={pickImage}>
                <Text>Select Image</Text>
            </Pressable>

            <View className="mx-5 mt-5">
                <Pressable 
                    onPress={onSave}
                    className="py-2 flex items-center justify-center h-[50px] rounded-2xl bg-[#22c55e]">
                    <Text className="text-white">Save</Text>
                </Pressable>
            </View>
        </View>
    )
}