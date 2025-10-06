// components/global/HiddenPostPlaceholder.tsx

import { View, Text, TouchableOpacity } from "react-native";

type HiddenPostPlaceholderProps = {
  onUndo: () => void;
};

export const HiddenPostPlaceholder = ({ onUndo }: HiddenPostPlaceholderProps) => {
  return (
    <View className="border-b border-gray-200 p-4 bg-gray-50">
      <View className="flex-row justify-between items-center">
        <Text className="text-gray-600">Postingan disembunyikan.</Text>
        <TouchableOpacity onPress={onUndo}>
          <Text className="font-bold text-blue-500">Urungkan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};