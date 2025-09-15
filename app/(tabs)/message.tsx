import React from 'react'
import { SafeAreaView,Platform, KeyboardAvoidingView, View, Text, FlatList, TextInput, Button } from 'react-native'
import { Session } from '@supabase/supabase-js'


export default function MessagePage(){
    const [session, setSession] = React.useState<Session | null>(null)
    const [input, setInput] = React.useState("")
    const [messages, setMessage] = React.useState([
        { id:"s", message:"tes", user_id:"asdf"},
        { id:"ss", message:"tes", user_id:"asddddf"},
        { id:"sasdf",message:"tes", user_id:"sss"},
        { id:"sas", message:"tes", user_id:"asdf"},
    ])

    const renderMessage = ({ item }:any) => {
        const isMe = item.user_id === "asdf" //session?.user.id;
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


    const sendMessage=()=>{}

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