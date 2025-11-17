// app/(tabs)/account/index.tsx
import { FontAwesome5, Feather } from "@expo/vector-icons";
import { View, Text, Image, ScrollView, TouchableOpacity, Pressable } from "react-native";
import { supabase } from '../../../lib/supabase';
import { router } from "expo-router";
import { useState } from "react";
import { SelectLanguage } from '../../../components/global/SelectLanguage';
import { i18n } from "../../../lib/i18n";

export default function AccountPage() {
  const [showSelectLang, setShowSelectLang] = useState(false);

  const onSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.replace("login");
  };

  const items = [
    { icon: "globe", label: i18n.t("language"), value: i18n.t("language_name"), action: () => setShowSelectLang(true) },
    { icon: "sliders", label: i18n.t("setting") },
    { icon: "help-circle", label: "FAQ" },
    { icon: "shield", label: "Kebijakan Privasi" },
    { icon: "file-text", label: "Syarat & Ketentuan" },
  ];

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: "white" }}>

      {/* HEADER */}
      <View style={{ backgroundColor: "#22c55e", borderBottomLeftRadius: 25, borderBottomRightRadius: 25, paddingBottom: 20, alignItems: "center" }}>
        <Image
          source={{ uri: "https://i.pravatar.cc/150" }}
          style={{ width: 70, height: 70, borderRadius: 100, marginTop: 20, borderWidth: 3, borderColor: "white" }}
        />
        <Text style={{ color: "white", fontSize: 18, marginTop: 5 }}>Bill</Text>
        <Text style={{ color: "white", fontSize: 13 }}>nickedward@gmail.com</Text>
      </View>

      {/* CARD */}
      <View style={{ marginHorizontal: 20, marginTop: -30, backgroundColor: "white", padding: 18, borderRadius: 15, elevation: 2 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
          <Text style={{ color: "#6b7280" }}>Name</Text>
          <Text style={{ color: "#22c55e" }}>Sata Lesmana</Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
          <Text style={{ color: "#6b7280" }}>E-mail</Text>
          <Text>demo@gmail.com</Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: "#6b7280" }}>Gender</Text>
          <Text>Male</Text>
        </View>

        <Pressable
          onPress={() => router.push("edit-profile")}
          style={{ marginTop: 15, paddingVertical: 10, backgroundColor: "#22c55e", borderRadius: 10, alignItems: "center" }}
        >
          <Text style={{ color: "white" }}>{i18n.t("edit_profile")}</Text>
        </Pressable>
      </View>

      {/* SETTINGS */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ marginLeft: 20, fontSize: 16, marginBottom: 8 }}>Settings</Text>

        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={item.action}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 14,
              marginHorizontal: 20,
              borderBottomWidth: 1,
              borderColor: "#e5e7eb",
              alignItems: "center",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Feather name={item.icon} size={20} color="#6B7280" />
              <Text style={{ marginLeft: 10 }}>{item.label}</Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {item.value && <Text style={{ marginRight: 6, color: "#6b7280" }}>{item.value}</Text>}
              <Feather name="chevron-right" size={18} color="#6B7280" />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <SelectLanguage visible={showSelectLang} onSelected={() => setShowSelectLang(false)} />
    </ScrollView>
  );
}

//hufttt