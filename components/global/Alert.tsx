import React from "react";
import { Modal, View, Text, Pressable } from "react-native";

interface AlertProps {
  visible: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
}

export const AlertDialog: React.FC<AlertProps> = ({ visible, title, message, onClose }) => {
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
        <View className="w-full md:w-[400px] bg-white rounded-t-2xl md:rounded-2xl p-6 shadow-lg">
          {title && <Text className="text-lg font-bold mb-2">{title}</Text>}
          {message && <Text className="text-base mb-4 text-gray-700">{message}</Text>}
          <Pressable
            onPress={onClose}
            className="self-end bg-blue-500 px-4 py-2 rounded-xl"
          >
            <Text className="text-white font-semibold">Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};
