import React from "react";
import { Modal, View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { i18n, changeLanguage } from '../../lib/i18n';


interface SelectLanguageProps {
  visible: boolean;
  onSelected: () => void;
}

export const SelectLanguage: React.FC<SelectLanguageProps> = ({ visible, onSelected }) => {

  const onSelectLang=(lang:string)=>{
    changeLanguage(lang)
    onSelected()
  }
  
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
            <Text className="pb-4 text-[16px]">{i18n.t('select_language')}</Text>
            <Pressable 
                onPress={()=>onSelectLang('id')} 
                className="py-2 flex-row justify-between">
                <Text>Indonesia</Text>
                {i18n.locale=='id' &&
                    <Ionicons name="checkmark" size={16} color="#3B82F6" />
                }
            </Pressable>

            <Pressable onPress={()=>onSelectLang('en')} className="py-2 flex-row justify-between">
                <Text>English</Text>
                {i18n.locale=='en' &&
                    <Ionicons name="checkmark" size={16} color="#3B82F6" />
                }
            </Pressable>
        </View>
      </View>
    </Modal>
  );
};
