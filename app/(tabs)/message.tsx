import React from 'react'
import { SafeAreaView, Platform, KeyboardAvoidingView, View, Text, FlatList, TextInput, Button, TouchableOpacity, Alert, Modal, Pressable } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { supabase } from "../../lib/supabase";
import dayjs from 'dayjs';

type Message = {
    id: number;
    user_id: string;
    message: string;
    email: string;
    created_at: string;
};

export default function MessagePage() {
    const [session, setSession] = React.useState<Session | null>(null)
    const [input, setInput] = React.useState("")
    const [messages, setMessage] = React.useState<Message[]>([]);
    const [editingMessage, setEditingMessage] = React.useState<Message | null>(null);
    const [menuVisible, setMenuVisible] = React.useState(false);
    const [selectedMessage, setSelectedMessage] = React.useState<Message | null>(null);


    React.useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        }).catch((error) => {
            console.error("Error getting session:", error)
        })

        fetchMessages();

        const channel = supabase
            .channel("messages-channel")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "message" },
                (payload) => {
                    setMessage((prev) => {
                        if (payload.eventType === "INSERT") {
                            // Add new message to the top
                            return [payload.new as Message, ...prev];
                        }
                        if (payload.eventType === "UPDATE") {
                            // Update the message in the list
                            return prev.map((msg) =>
                                msg.id === payload.new.id ? payload.new as Message : msg
                            );
                        }
                        if (payload.eventType === "DELETE") {
                            // Remove the deleted message
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
            .schema('public')
            .from("message")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50);
        setMessage(data);
    }

    async function sendMessage() {
        if (!input.trim()) return;

        const data = {
            user_id: session?.user.id,
            message: input,
            email: session?.user.email
        }

        const { error } = await supabase
            .schema('public')
            .from("message")
            .insert(data)

        setInput("");
        if (error) {
            console.error("Error sending message:", error);
            Alert.alert("Error", "Failed to send message.");
        }
    }

    async function handleUpdateMessage() {
        if (!input.trim() || !editingMessage || !session?.user) return;

        const { error } = await supabase
            .from("message")
            .update({ message: input })
            .eq("id", editingMessage.id)
            .eq("user_id", session.user.id); // Verifikasi kepemilikan

        if (error) {
            console.error("Error updating message:", error);
            Alert.alert("Error", "Failed to update message.");
        }

        // Reset state setelah update
        setInput("");
        setEditingMessage(null);
    }

    const startEditing = (message: Message) => {
        if (message.user_id === session?.user.id) {
            setEditingMessage(message);
            setInput(message.message);
        }
    };

    const cancelEditing = () => {
        setEditingMessage(null);
        setInput("");
    };

    const handleLongPress = (message: Message) => {
        if (message.user_id === session?.user.id) {
            setSelectedMessage(message);
            setMenuVisible(true);
        }
    };

    const handleEditOption = () => {
        if (selectedMessage) {
            startEditing(selectedMessage);
        }
        setMenuVisible(false);
        setSelectedMessage(null);
    };

    const renderMessage = ({ item }: any) => {
        const isMe = item.user_id === session?.user.id;
        return (
            <TouchableOpacity
                onLongPress={() => handleLongPress(item)}
                disabled={!isMe}
                activeOpacity={0.8}
            >
                <View
                    style={{
                        alignSelf: isMe ? "flex-end" : "flex-start",
                        backgroundColor: isMe ? "#DCF8C6" : "#ECECEC",
                        marginVertical: 4,
                        padding: 10,
                        borderRadius: 12,
                        maxWidth: "75%",
                        borderWidth: editingMessage?.id === item.id ? 2 : 0,
                        borderColor: editingMessage?.id === item.id ? "#3498db" : "transparent",
                    }}
                >
                    <Text className="text-[14px] font-semibold">{item.email}</Text>
                    <Text className="text-[16px] my-1">{item.message}</Text>
                    <Text className="text-[10px] text-neutral-500 mt-1 text-right">
                        {dayjs(item.created_at).format("HH:mm")}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
        >
            <Modal
                transparent={true}
                visible={menuVisible}
                onRequestClose={() => setMenuVisible(false)}
                animationType="fade"
            >
                <Pressable className="flex-1" onPress={() => setMenuVisible(false)}>
                    <View className="absolute top-1/3 self-center bg-white rounded-lg shadow-lg p-2 w-40">
                        {selectedMessage && dayjs().diff(dayjs(selectedMessage.created_at), 'minute') < 10 && (
                            <TouchableOpacity onPress={handleEditOption} className="p-3">
                                <Text>Edit</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={() => Alert.alert("Info", "Fitur 'Salin' belum diimplementasikan.")}
                            className="p-3"
                        >
                            <Text>Salin</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => Alert.alert("Info", "Fitur 'Hapus' belum diimplementasikan.")}
                            className="p-3"
                        >
                            <Text>Hapus</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

            <SafeAreaView style={{ flex: 1, padding: 16 }}>
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id.toString()}
                    inverted
                    renderItem={renderMessage}
                    contentContainerStyle={{ paddingVertical: 10 }}
                />

                <View className="border-t border-neutral-200 pt-2">
                    {editingMessage && (
                        <View className="flex-row justify-between items-center pb-2 px-1">
                            <Text>Editing message...</Text>
                            <Button title="Cancel" onPress={cancelEditing} color="red" />
                        </View>
                    )}
                    <View className="flex-row items-center">
                        <TextInput
                            value={input}
                            onChangeText={setInput}
                            placeholder="Type a message..."
                            className="flex-1 border border-neutral-300 rounded-2xl px-3 py-2 mr-2"
                        />
                        <Button title={editingMessage ? "Save" : "Send"} onPress={editingMessage ? handleUpdateMessage : sendMessage} />
                    </View>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    )
}