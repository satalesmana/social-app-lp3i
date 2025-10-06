import React from "react";
import {
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  View,
  Text,
  FlatList,
  TextInput,
  Button,
} from "react-native";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import dayjs from "dayjs";
import { useTheme } from "./_layout"; // <-- ambil context dark mode

type Message = {
  id: number;
  user_id: string;
  message: string;
  email: string;
  created_at: string;
};

export default function MessagePage() {
  const { darkMode } = useTheme();
  const [session, setSession] = React.useState<Session | null>(null);
  const [input, setInput] = React.useState("");
  const [messages, setMessage] = React.useState<Message[]>([]);

  React.useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
      })
      .catch((error) => {
        console.error("Error getting session:", error);
      });

    fetchMessages();

    const channel = supabase
      .channel("messages-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "message" },
        (payload) => {
          setMessage((prev) => {
            if (payload.eventType === "INSERT") {
              return [payload.new as Message, ...prev];
            }
            if (payload.eventType === "UPDATE") {
              return prev.map((msg) =>
                msg.id === payload.new.id ? (payload.new as Message) : msg
              );
            }
            if (payload.eventType === "DELETE") {
              return prev.filter((msg) => msg.id !== payload.old.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchMessages() {
    const { data } = await supabase
      .schema("public")
      .from("message")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setMessage(data || []);
  }

  async function sendMessage() {
    if (!input.trim()) return;

    const data = {
      user_id: session?.user.id,
      message: input,
      email: session?.user.email,
    };

    const { error } = await supabase.schema("public").from("message").insert(data);

    setInput("");
    if (error) {
      console.error("Error sending message:", error);
    }
  }

  const renderMessage = ({ item }: any) => {
    const isMe = item.user_id === session?.user.id;
    return (
      <View
        style={{
          alignSelf: isMe ? "flex-end" : "flex-start",
          backgroundColor: isMe
            ? darkMode
              ? "#065f46" // hijau tua kalau dark
              : "#DCF8C6"
            : darkMode
            ? "#333" // bubble orang lain dark
            : "#ECECEC",
          marginVertical: 4,
          padding: 10,
          borderRadius: 12,
          maxWidth: "75%",
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: darkMode ? "#bbb" : "#000",
          }}
        >
          {item.email}
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: darkMode ? "#fff" : "#000",
          }}
        >
          {item.message}
        </Text>
        <Text
          style={{
            fontSize: 10,
            marginTop: 4,
            textAlign: "right",
            color: darkMode ? "#999" : "#555",
          }}
        >
          {dayjs(item.created_at).format("HH:mm")}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      style={{ backgroundColor: darkMode ? "#111" : "#fff" }}
    >
      <SafeAreaView style={{ flex: 1, padding: 16 }}>
        {/* List Pesan */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          inverted
          renderItem={renderMessage}
          contentContainerStyle={{ paddingVertical: 10 }}
        />

        {/* Input Pesan */}
        <View
          className="flex-row items-center py-2"
          style={{
            borderTopWidth: 1,
            borderColor: darkMode ? "#444" : "#e5e7eb",
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor={darkMode ? "#888" : "#999"}
            className="flex-1 rounded-2xl px-3 py-2 mr-2"
            style={{
              borderWidth: 1,
              borderColor: darkMode ? "#555" : "#ccc",
              color: darkMode ? "#fff" : "#000",
            }}
          />
          <Button title="Send" onPress={sendMessage} />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
