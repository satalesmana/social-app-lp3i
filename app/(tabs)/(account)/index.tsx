import { FontAwesome5, Feather } from "@expo/vector-icons";
import { View, Text, Image, ScrollView, TouchableOpacity, Pressable } from "react-native";
import { supabase } from '../../../lib/supabase';
import { router } from "expo-router"
import { useState } from "react";
import { SelectLanguage } from '../../../components/global/SelectLanguage'
import { i18n } from "../../../lib/i18n"


export default function AccountPage(){
    const [showSelectLang, setShowSectLang] = useState(false)

    const onSignOut=async()=>{
        const { error } = await supabase.auth.signOut({ scope: 'local' })

        if(!error){
            router.replace("login")
        }
    }
    
    const onEditProfile=()=>{
        router.push("edit-profile")
    }

    const items = [
      { icon: "globe", label: i18n.t('language'), value: i18n.t('language_name'), action: ()=> setShowSectLang(true)},
      { icon: "sliders", label: i18n.t('setting') },
      { icon: "help-circle", label: "FAQ" },
      { icon: "shield", label: "Kebijakan Privasi" },
      { icon: "file-text", label: "Syarat & Ketentuan" },
      { icon: "file", label: "Lisensi Perangkat Lunak" },
      { icon: "mail", label: "Kontak Kami" },
    ];

    return(
        <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor:'white' }}>
        {/* Header */}
        <View className="bg-green-500 rounded-b-3xl pb-16 items-center">
          {/* Profile Image */}
          <Image
            source={{
              uri: "https://i.pravatar.cc/150?img=5", // demo avatar
            }}
            className="w-20 h-20 rounded-full mt-6 border-4 border-white"
          />
          <Text className="text-white text-lg font-semibold mt-2">Bill</Text>
          <Text className="text-white text-sm">nickedward@gmail.com</Text>
        </View>

        {/* Card Section */}
        <View className="mx-5 -mt-10 bg-white rounded-2xl p-5 shadow-md">
          {/* Info Section */}
          <View className="space-y-4">
            <View className="flex-row justify-between">
              <Text className="text-gray-500">Name</Text>
              <Text className="text-green-600 font-medium">Sata Lesmana</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-500">E-mail</Text>
              <Text className="text-gray-700">demo@gmail.com</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-500">Gender:</Text>
              <Text className="text-gray-700">Male</Text>
            </View>
          </View>

           <Pressable 
              onPress={onEditProfile}
              className="mt-3 py-2 flex items-center justify-center h-[40px] rounded-2xl bg-[#22c55e]">
              <Text className="text-white">
                {i18n.t('edit_profile')}
              </Text>
          </Pressable>
        </View>

        <View className="mt-5">
            <Text className="mx-5">Settings</Text>

            <View className="mx-5">
              {items.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  className="flex-row items-center justify-between py-4 border-b border-gray-200"
                  activeOpacity={0.6}
                  onPress={item?.action}
                >
                  <View className="flex-row items-center space-x-3">
                    <Feather name={item.icon} size={20} color="#6B7280" />
                    <Text className="text-base text-gray-800">{item.label}</Text>
                  </View>

                  <View className="flex-row items-center space-x-2">
                    {item.value && (
                      <Text className="text-sm text-gray-500">{item.value}</Text>
                    )}
                    <Feather name="chevron-right" size={18} color="#6B7280" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
             
            <SelectLanguage visible={showSelectLang} key="selectLang" onSelected={()=>setShowSectLang(false)}/>
        </View>
      </ScrollView>
  )
}