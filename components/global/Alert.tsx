import React from "react";
import { Modal, View, Text, Pressable } from "react-native";

interface AlertAction {
  text: string;
  onPress: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface AlertProps {
  visible: boolean;
  title?: string;
  message?: string;
  actions?: AlertAction[];
  onClose: () => void;
}

export const AlertDialog: React.FC<AlertProps> = ({
  visible,
  title,
  message,
  actions = [],
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="w-11/12 md:w-[400px] bg-white rounded-2xl p-6 shadow-lg">
          {title && <Text className="text-lg font-bold mb-2">{title}</Text>}
          {message && <Text className="text-base mb-4 text-gray-700">{message}</Text>}

          <View className="flex-row justify-end space-x-3">
            {actions.length > 0 ? (
              actions.map((action, index) => (
                <Pressable
                  key={index}
                  onPress={action.onPress}
                  className={`px-4 py-2 rounded-xl ${
                    action.style === "destructive"
                      ? "bg-red-600"
                      : action.style === "cancel"
                      ? "bg-gray-300"
                      : "bg-blue-500"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      action.style === "cancel" ? "text-black" : "text-white"
                    }`}
                  >
                    {action.text}
                  </Text>
                </Pressable>
              ))
            ) : (
              <Pressable
                onPress={onClose}
                className="self-end bg-blue-500 px-4 py-2 rounded-xl"
              >
                <Text className="text-white font-semibold">Tutup</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};
