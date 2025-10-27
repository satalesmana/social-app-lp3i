import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, View, Text, Pressable, TextInput, Image, Platform, TouchableOpacity } from "react-native";
import {supabase} from "../../../lib/supabase"

interface AlertProps {
  visible: boolean;
  onClose: () => void;
  onSubmitedPost: () => void;
}

const UiHeader = (props:any)=>{
    if(Platform.OS !== "web"){
      return (
        <View className="border-b border-gray-300  flex-row items-center space-x-3">
          <View className="flex-1">
            <Pressable >
              <Ionicons name="image-outline" size={24} color="#1DA1F2" />
            </Pressable>
          </View>
          <Text className="text-[15px]">{props.characterCount} Character left</Text>
        </View>
      )
    }
    return (
      <View className="flex flex-row w-full justify-between">
        <Pressable
          onPress={props.onClose}
          className=" border-[#0088FF] border h-[39px] px-4 py-2 rounded-xl"
        >
          <Text className="text-center text-[#404040] font-semibold">Close</Text>
        </Pressable>

        <Pressable
          onPress={props.onSave}
          className=" bg-[#1DA1F2] h-[39px] px-4 py-2 rounded-xl"
        >
          <Text className="text-center text-white font-semibold">Post</Text>
        </Pressable>
      </View>
    )
}

const UiFooter=(props:any)=>{
  if(Platform.OS !== "web"){
    return(
      <View className="space-y-3 gap-4">
        <TouchableOpacity
          onPress={props.onSave}
          className="w-full bg-[#1DA1F2] h-[39px] px-4 py-2 rounded-xl"
        >
          <Text className="text-center text-white font-semibold">Save</Text>
        </TouchableOpacity>

        <Pressable
          onPress={props.onClose}
          className="w-full border-[#0088FF] border h-[39px] px-4 py-2 rounded-xl"
        >
          <Text className="text-center text-[#404040] font-semibold">Close</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View className="border-t border-gray-300  flex-row items-center space-x-3">
      <View className="flex-1">
        <Pressable>
          <Ionicons name="image-outline" size={24} color="#1DA1F2" />
        </Pressable>
      </View>
      <Text className="text-[15px]">{props.characterCount} Character left</Text>
    </View>
  )
}


export const FormInputPost: React.FC<AlertProps> = ({ visible, onClose, onSubmitedPost }) => {
  const [value, onChangeText] = React.useState("");
  const [session, setSession] = React.useState<Session | null>(null)
  const [image, setImage] = React.useState("");
  
  const characterCount = 300 - (value?.length || 0);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
    }).catch((error) => {
        console.error("Error getting session:", error)
    })
  })

  

  const onSave =async ()=>{
    if(value.length <=0) return;

    const data = { 
        createdby: session?.user?.user_metadata.full_name, 
        text: value,
        handle: session?.user.email,
        image: image,
        likes:[],
        comments:[],
        shares:[]
    }

    const { error } =  await supabase
        .schema('public')
        .from("post")
        .insert(data)

    onChangeText("");

    if(error){
        console.error("Error sending message:", error);
    }
    onClose()
    onSubmitedPost()
  }

  

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View
        className={`flex-1 bg-black/50 md:justify-center justify-end items-center`}
      >
        <View className="w-full md:w-[657px] bg-white rounded-t-2xl md:rounded-2xl p-6 shadow-lg">

          <UiHeader characterCount={characterCount} onSave={onSave} onClose={onClose}/>

          <View className="mt-4 flex-row items-start">
            <Image
              source={{ uri: "https://randomuser.me/api/portraits/women/44.jpg" }}
              className="w-10 h-10 rounded-full mr-3 mt-2"
              />
            <TextInput
              editable
              multiline
              numberOfLines={4}
              placeholder="What's happening?"
              maxLength={300}
              style={{ textAlignVertical: 'top' }}
              onChangeText={text => onChangeText(text)}
              value={value}
              className="mx-2 my-4 h-[200px] w-full"
            />        
          </View>
          <UiFooter  onSave={onSave} onClose={onClose}/>
        </View>
      </View>
    </Modal>
  );
};
