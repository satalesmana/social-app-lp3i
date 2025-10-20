import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, View, Text, Pressable, TextInput, Image } from "react-native";

interface AlertProps {
  visible: boolean;
  onSubmit: () => void;
  onClose: () => void;
}

export const FormInputPost: React.FC<AlertProps> = ({ visible, onSubmit, onClose }) => {
  const [value, onChangeText] = React.useState(null);

  const characterCount = 300 - (value?.length || 0);

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
          <View className="flex-row items-center space-x-3">
            <View className="flex-1">
              <Pressable>
                <Ionicons name="image-outline" size={24} color="#1DA1F2" />
              </Pressable>
            </View>

            <Text className="text-[15px]">{characterCount} Character left</Text>
          </View>

          <View className="border-t border-gray-300 mt-4 flex-row items-start">
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
         
          <View className="space-y-3 gap-4">
            <Pressable
              onPress={onClose}
              className="w-full bg-[#1DA1F2] h-[39px] px-4 py-2 rounded-xl"
            >
              <Text className="text-center text-white font-semibold">Post</Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              className="w-full border-[#0088FF] border h-[39px] px-4 py-2 rounded-xl"
            >
              <Text className="text-center text-[#404040] font-semibold">Close</Text>
            </Pressable>
          </View>

        </View>
      </View>
    </Modal>
  );
};
