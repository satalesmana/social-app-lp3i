import React from 'react'
import { SafeAreaView,Platform, KeyboardAvoidingView, View, Text, FlatList, TextInput, Button } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { supabase } from "../../lib/supabase";
type Message = {
    id: number;
    user_id: string;
    message: string;
    email: string;
    created_at: string;
};

export default function MessagePage(){
    const [session, setSession] = React.useState<Session | null>(null)
    const [input, setInput] = React.useState("")
    const [messages, setMessage] = React.useState<Message[]>([]);

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
     },[]);

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

        const { error } =  await supabase
            .schema('public')
            .from("message")
            .insert(data)

        setInput("");
        if(error){
            console.error("Error sending message:", error);
        }
    }

    const renderMessage = ({ item }:any) => {
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
                <Text className="text-[16px]">{item.message}</Text>
                <Text className="text-[10px] text-neutral-500 mt-1 text-right">
                    {/* {dayjs(item.created_at).format("HH:mm")} */}
                </Text>
            </View>
        );
    };

    return(
         <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
        >
            <SafeAreaView style={{ flex: 1, padding: 16 }}>
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
    )
}