import {View, Pressable, Text, TextInput, TouchableOpacity, Image, ScrollView } from "react-native";
import { Session } from '@supabase/supabase-js'
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react"
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../../../lib/supabase';
import { SelectGender } from '../../../components/global/SelectGender'
import { supabase } from '../../../lib/supabase'


export default function EditAccount(){
    const [image, setImage] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageName, setImageName] = useState<string | null>(null);
    const [name, setName]= useState('')
    const [selectGender, setSelectGender]= useState(false)
    const [email, setEmail] = useState('')
    const [gender, setGender] = useState('Male')

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
            const res = await uploadImage(image as string, imageName as string)

            if(res?.fullPath)
                setImageUrl(`https://isibdtuopxlgxxkldvhy.supabase.co/storage/v1/object/public/${res?.fullPath}`)
        }
    }

    const onSelectedGender=(value:string)=>{
        setSelectGender(false)
        setGender(value)
    }

    const onSave=async()=>{
        const { data, error } = await supabase.auth.updateUser({
            data: { 
                full_name: name, 
                gender: gender, 
                avatar_url: imageUrl
            },
        });
        if (error) console.error(error);
    }

    const onLoadSession=()=>{
        supabase.auth.getSession().then(({ data: { session } }) => {
            setEmail(session?.user.email as string)
            setGender(session?.user.user_metadata.gender as string)
            setImageUrl(session?.user.user_metadata.avatar_url as string)
            setName(session?.user.user_metadata.full_name as string)
        }).catch((error) => {
            console.error("Error getting session:", error)
        })
    }

    useEffect(() => {
        onLoadSession()
    },[])

    return(
        <ScrollView className="flex-1 bg-white">
            <View className="items-center mt-8 mb-6">
                <View className="relative">
                    {imageUrl && 
                        <Image
                        source={{ uri: imageUrl }}
                        className="w-28 h-28 rounded-full"
                    />
                    }
                
                <TouchableOpacity 
                    onPress={pickImage}
                    className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow">
                    <Ionicons name="pencil-outline" size={16} color="#3B82F6" />
                </TouchableOpacity>
                </View>
            </View>

            <View className="px-6 space-y-4">
                <View>
                    <Text className="text-gray-700 mb-1">Full Name</Text>
                    <TextInput
                        placeholder="Type full name"
                        value={name}
                        onChangeText={setName}
                        className="border border-gray-200 rounded-2xl px-4 py-3 bg-gray-50"
                    />
                </View>

                <View className="pt-4">
                    <View className="flex-row justify-between mb-1">
                        <Text className="text-gray-700">Email Address</Text>
                        <View className="flex-row items-center">
                            <Ionicons name="checkmark" size={14} color="#0ca01fff" />
                            <Text className="text-xs text-blue-500 ml-1">VERIFIED</Text>
                        </View>
                    </View>
                    <TextInput
                        placeholder={email}
                        editable={false}
                        className="border border-gray-200 rounded-2xl px-4 py-3 bg-gray-100 text-gray-500"
                    />
                </View>

                <Pressable className="pt-4" onPress={()=> setSelectGender(true)}>
                    <Text className="text-gray-700 mb-1">Gender</Text>
                    <View className="flex-row items-center border border-gray-200 rounded-2xl px-4 py-3 bg-gray-50 justify-between">
                        <Text className="text-gray-700">{gender}</Text>
                        <Ionicons name="chevron-down" size={20} color="gray" />
                    </View>
                </Pressable>
            </View>

            <SelectGender visible={selectGender} onSelect={onSelectedGender} value={gender}/>
            
            <View className="px-6 mt-10 mb-10">
                <TouchableOpacity onPress={onSave} className="bg-blue-600 py-4 rounded-full items-center">
                    <Text className="text-white font-semibold">Saved Change</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}