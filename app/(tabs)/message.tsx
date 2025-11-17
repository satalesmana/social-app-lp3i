// app/(tabs)/message.tsx //

import React from 'react'
import { SafeAreaView,Platform, KeyboardAvoidingView, View, Text, FlatList, TextInput, Button, TouchableOpacity, Animated } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { supabase } from "../../lib/supabase";
import dayjs from 'dayjs';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

// -- IMPORT REDUX --
import { useAppSelector, useAppDispatch } from '../../lib/redux/hooks';
import { fetchMessages, sendMessage } from '../../lib/redux/messageSlice';

// Definisikan ulang Tipe Message (atau import dari slice jika Anda mengekspornya)
type Message = {
    id: number;
    user_id: string;
    message: string;
    email: string;
    created_at: string;
    reply_to: number | null;
    original_message?: {
        message: string;
        email: string;
    } | null;
};

// Komponen untuk Aksi Swipe (hanya untuk mobile)
const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, onPress: () => void) => {
    const trans = dragX.interpolate({
        inputRange: [-80, 0],
        outputRange: [0, 80],
        extrapolate: 'clamp',
    });
    return (
        <TouchableOpacity onPress={onPress}>
            <Animated.View style={{ transform: [{ translateX: trans }] }} className="flex-1 w-20 items-center justify-center">
                <Ionicons name="arrow-undo" size={24} color="#34d399" />
            </Animated.View>
        </TouchableOpacity>
    );
};


export default function MessagePage() {
    const dispatch = useAppDispatch(); // <-- Gunakan hook Redux

    // -- Ambil state dari REDUX --
    const { messages, status: messageStatus } = useAppSelector((state) => state.messages);

    // State lokal untuk UI (session, input, dll)
    const [session, setSession] = React.useState<Session | null>(null);
    const [input, setInput] = React.useState("");
    const [replyingTo, setReplyingTo] = React.useState<Message | null>(null);
    const [hoveredMessageId, setHoveredMessageId] = React.useState<number | null>(null);
    const swipeableRefs = React.useRef<{ [key: number]: Swipeable | null }>({});


    React.useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        // -- Panggil Thunk fetchMessages saat komponen load --
        dispatch(fetchMessages());

        // Setup subscription (ini sudah benar)
        const channel = supabase
            .channel("messages-channel")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "message" },
                () => {
                    // -- Panggil Thunk lagi jika ada data baru dari subscription --
                    dispatch(fetchMessages());
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [dispatch]); // tambahkan dispatch ke dependency array

    // Fungsi fetchMessages() YANG LAMA sudah dihapus, karena logikanya pindah ke Thunk

    // -- Modifikasi fungsi sendMessage untuk dispatch Thunk --
    async function handleSendMessage() {
        if (!input.trim() || !session) return;
        
        // Panggil Thunk sendMessage
        dispatch(sendMessage({ input, session, replyingTo }));

        // Reset input lokal
        setInput("");
        setReplyingTo(null);
    }

    const handleReply = (message: Message) => {
        setReplyingTo(message);
        if (Platform.OS !== 'web') {
            swipeableRefs.current[message.id]?.close();
        }
    };

    const cancelReply = () => setReplyingTo(null);

    const renderMessage = ({ item }: { item: Message }) => {
        
        const isMe = item.user_id === session?.user.id;
        const MessageBubble = (
            <View
                style={{
                    backgroundColor: isMe ? "#DCF8C6" : "#ECECEC",
                    padding: 10,
                    borderRadius: 12,
                    maxWidth: "75%",
                }}
            >
                {item.original_message && (
                    <View className="bg-gray-200/60 p-2 rounded-lg mb-2 border-l-2 border-green-500">
                        <Text className="text-[12px] font-bold text-green-600">{item.original_message.email}</Text>
                        <Text className="text-[14px] text-gray-600" numberOfLines={2}>{item.original_message.message}</Text>
                    </View>
                )}
                <Text className="text-[14px] font-bold">{item.email}</Text>
                <Text className="text-[16px]">{item.message}</Text>
                <Text className="text-[10px] text-neutral-500 mt-1 text-right">
                    {dayjs(item.created_at).format("HH:mm")}
                </Text>
            </View>
        );

        if (Platform.OS === 'web') {
            return (
                <View
                    // @ts-ignore: onMouseEnter/onMouseLeave ada di React Native Web
                    onMouseEnter={() => setHoveredMessageId(item.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                    className={`my-1 flex-row items-center ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                    {!isMe && hoveredMessageId === item.id && (
                         <TouchableOpacity onPress={() => handleReply(item)} className="p-2 mr-1">
                            <Ionicons name="arrow-undo" size={18} color="gray" />
                        </TouchableOpacity>
                    )}
                   
                    {MessageBubble}

                    {isMe && hoveredMessageId === item.id && (
                         <TouchableOpacity onPress={() => handleReply(item)} className="p-2 ml-1">
                            <Ionicons name="arrow-undo" size={18} color="gray" />
                        </TouchableOpacity>
                    )}
                </View>
            );
        }

        return (
            <Swipeable
                ref={(ref) => (swipeableRefs.current[item.id] = ref)}
                renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, () => handleReply(item))}
                overshootRight={false}
            >
                <View style={{ alignSelf: isMe ? 'flex-end' : 'flex-start' }}>
                    {MessageBubble}
                </View>
            </Swipeable>
        );
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            >
                <SafeAreaView className="flex-1 p-4">
                    {/* Tampilkan loading spinner jika status 'loading' */}
                    {messageStatus === 'loading' && messages.length === 0 && (
                        <View className="absolute top-0 left-0 right-0 p-2 items-center">
                            <Text className="text-gray-500">Loading messages...</Text>
                        </View>
                    )}
                    <FlatList
                        data={messages} // <-- Data diambil dari Redux
                        keyExtractor={(item) => item.id.toString()}
                        inverted
                        renderItem={renderMessage}
                        contentContainerStyle={{ paddingVertical: 10 }}
                    />
                    <View className="border-t border-neutral-200 pt-2">
                        {replyingTo && (
                            <View className="bg-gray-100 p-2 rounded-lg mb-2 flex-row justify-between items-center">
                                <View className="flex-1">
                                    <Text className="text-xs font-bold">Replying to {replyingTo.email}</Text>
                                    <Text className="text-sm text-gray-600" numberOfLines={1}>{replyingTo.message}</Text>
                                </View>
                                <TouchableOpacity onPress={cancelReply}>
                                    <Ionicons name="close-circle" size={22} color="gray" />
                                </TouchableOpacity>
                            </View>
                        )}
                        <View className="flex-row items-center">
                            <TextInput
                                value={input}
                                onChangeText={setInput}
                                placeholder="Type a message..."
                                className="flex-1 border border-neutral-300 rounded-2xl px-3 py-2 mr-2"
                            />
                            {/* Panggil handleSendMessage */}
                            <Button title="Send" onPress={handleSendMessage} disabled={!input.trim()} />
                        </View>
                    </View>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </GestureHandlerRootView>
    );
}