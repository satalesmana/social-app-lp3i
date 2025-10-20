import React from "react";
import { Modal, View, Text, Pressable, TextInput } from "react-native";

interface AlertProps {
  visible: boolean;
  onSubmit: () => void;
  onClose: () => void;
}

export const FormInputPost: React.FC<AlertProps> = ({ visible, onSubmit, onClose }) => {
  const [value, onChangeText] = React.useState(null);

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
         <TextInput
            editable
            multiline
            numberOfLines={4}
            maxLength={300}
            onChangeText={text => onChangeText(text)}
            value={value}
            className="mx-2 my-4 border rounded h-[200px]"
          />

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
