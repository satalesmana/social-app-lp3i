// components/global/ReportModal.tsx

import { View, Text, Modal, TouchableOpacity } from "react-native";

const reportReasons = [ 'Ini adalah spam', 'Ujaran kebencian', 'Informasi palsu', 'Pelecehan', 'Konten tidak pantas' ];

type ReportModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
};

export const ReportModal = ({ visible, onClose, onSubmit }: ReportModalProps) => {
  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="m-5 bg-white rounded-2xl p-6 items-center w-11/12 shadow-lg">
          <Text className="text-xl font-bold mb-5">Laporkan Postingan</Text>
          {reportReasons.map(reason => (
            <TouchableOpacity key={reason} className="w-full py-4 border-b border-gray-200" onPress={() => onSubmit(reason)}>
              <Text className="text-base text-center">{reason}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity className="mt-4 bg-gray-100 rounded-lg py-3 px-8" onPress={onClose}>
            <Text className="text-black font-bold text-center">Batal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};