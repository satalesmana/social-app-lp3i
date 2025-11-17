
import React from 'react'
import { SafeAreaView, Platform, KeyboardAvoidingView, View, Text, FlatList, TextInput, Button, ActivityIndicator } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { supabase } from "../../lib/supabase"; 
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store'; 
import { 
  fetchMessages,     // Thunk untuk mengambil
  sendMessage,       // Thunk untuk mengirim
  messageReceived,   // untuk realtime insert
  messageUpdated,    // untuk realtime update
  messageDeleted,     // untuk realtime delete
  Message
} from '../../store/features/messagesSlice'; 


export default function MessagePage(){
    const [session, setSession] = React.useState<Session | null>(null)
    const [input, setInput] = React.useState("")
    const dispatch = useDispatch<AppDispatch>();    
    const messages = useSelector((state: RootState) => state.messages.items);
    const loadingStatus = useSelector((state: RootState) => state.messages.loading);
    const error = useSelector((state: RootState) => state.messages.error);

    React.useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        }).catch((error) => {
            console.error("Error getting session:", error)
        })
        dispatch(fetchMessages());


        const channel = supabase
            .channel("messages-channel")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "message" },
                (payload) => {
                    if (payload.eventType === "INSERT") {
                        // Kirim data ke reducer 'messageReceived'
                        dispatch(messageReceived(payload.new as Message));
                    }
                    if (payload.eventType === "UPDATE") {
                        dispatch(messageUpdated(payload.new as Message));
                    }
                    if (payload.eventType === "DELETE") {
                        dispatch(messageDeleted(payload as any));
                    }
                }
            )
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    },[dispatch]); 


    async function handleSendMessage() {
        if (!input.trim() || !session) return;
        const messageData = { 
            user_id: session?.user.id, 
            message: input,
            email: session?.user.email
        }
        try {
            
            await dispatch(sendMessage(messageData)).unwrap();
            setInput("");

        } catch (rejectedValueOrSerializedError) {
            console.error("Failed to send message:", rejectedValueOrSerializedError);
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
                <Text className="text-[14px]">{item.email}</Text>
                <Text className="text-[16px]">{item.message}</Text>
                <Text className="text-[10px] text-neutral-500 mt-1 text-right">
                    {dayjs(item.created_at).format("HH:mm")}
                </Text>
            </View>
        );
    };


    if (loadingStatus === 'pending') {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
                <Text>Loading messages...</Text>
            </SafeAreaView>
        );
    }
    
    if (error) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Error fetching messages:</Text>
                <Text>{error}</Text>
            </SafeAreaView>
        );
    }
    
    return(
         <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
        >
            <SafeAreaView style={{ flex: 1, padding: 16 }}>
                <FlatList
                    data={messages} // <-- Data sekarang dari Redux
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
                        onSubmitEditing={handleSendMessage}
                        returnKeyType="send"
                    />
                    <Button title="Send" onPress={handleSendMessage} /> 
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    )
}