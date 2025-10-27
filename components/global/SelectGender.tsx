import React from "react";
import { Modal, View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";


interface AlertProps {
  visible: boolean;
  value:string;
  onSelect: (value:string) => void;
}

export const SelectGender: React.FC<AlertProps> = ({ visible, value, onSelect }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
    >
      <View
        className={`flex-1 bg-black/50 md:justify-center justify-end items-center`}
      >
        <View className="w-full md:w-[400px] bg-white rounded-t-2xl md:rounded-2xl p-6 shadow-lg">
            <Text className="pb-4 text-[16px]">Select Gender</Text>
            <Pressable 
                onPress={()=>onSelect('Male')} 
                className="py-2 flex-row justify-between">
                <Text>Male</Text>
                {value=='Male' &&
                    <Ionicons name="checkmark" size={16} color="#3B82F6" />
                }
            </Pressable>

            <Pressable onPress={()=>onSelect('Female')} className="py-2 flex-row justify-between">
                <Text>Female</Text>
                {value=='Female' &&
                    <Ionicons name="checkmark" size={16} color="#3B82F6" />
                }
            </Pressable>
        </View>
      </View>
    </Modal>
  );
};
