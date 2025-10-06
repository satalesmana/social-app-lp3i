import React, { useEffect, useState } from "react";
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

type Message = {
  id: number;
  user_id: string;
  message: string;
  email: string;
  created_at: string;
};

export default function MessagePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Ambil session user aktif
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setSession(session))
      .catch((error) => console.error("Error getting session:", error));

    // Ambil pesan awal
    fetchMessages();

    // Real-time listener untuk pesan baru
    const channel = supabase
      .channel("messages-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "message" },
        (payload) => {
          setMessages((prev) => {
            switch (payload.eventType) {
              case "INSERT":
                return [payload.new as Message, ...prev];
              case "UPDATE":
                return prev.map((msg) =>
                  msg.id === payload.new.id ? (payload.new as Message) : msg
                );
              case "DELETE":
                return prev.filter((msg) => msg.id !== payload.old.id);
              default:
                return prev;
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchMessages() {
    const { data, error } = await supabase
      .from("message")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) console.error("Error fetching messages:", error);
    else setMessages(data || []);
  }

  async function sendMessage() {
    if (!input.trim() || !session?.user) return;

    const { error } = await supabase.from("message").insert({
      user_id: session.user.id,
      message: input.trim(),
      email: session.user.email,
    });

    if (error) console.error("Error sending message:", error);
    setInput("");
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.user_id === session?.user.id;
    return (
      <View
        style={{
          alignSelf: isMe ? "flex-end" : "flex-start",
          backgroundColor: isMe ? "#DCF8C6" : "#ECECEC",
          marginVertical: 4,
          padding: 10,
          borderRadius: 12,
          maxWidth: "75%",
        }}
      >
        <Text className="text-[14px] font-semibold">{item.email}</Text>
        <Text className="text-[16px]">{item.message}</Text>
        <Text className="text-[10px] text-neutral-500 mt-1 text-right">
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
    >
      <SafeAreaView className="flex-1 px-4">
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          inverted
          renderItem={renderMessage}
          contentContainerStyle={{ paddingVertical: 10 }}
        />

        <View className="flex-row items-center border-t border-neutral-200 py-2">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            className="flex-1 border border-neutral-300 rounded-2xl px-3 py-2 mr-2"
          />
          <Button title="Send" onPress={sendMessage} />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
