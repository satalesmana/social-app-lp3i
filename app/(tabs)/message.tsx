import React from 'react';
import {
    SafeAreaView,
    Platform,
    KeyboardAvoidingView,
    View,
    Text,
    FlatList,
    TextInput,
    Button,
    TouchableOpacity,
    Animated,
    Alert
} from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from "../../lib/supabase";
import dayjs from 'dayjs';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

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

// Komponen Aksi yang bisa digunakan untuk geser kiri atau kanan
const renderActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, onPress: () => void) => {
    const scale = dragX.interpolate({
        inputRange: [-80, 0, 80],
        outputRange: [1, 0, 1],
        extrapolate: 'clamp',
    });
    return (
        <TouchableOpacity onPress={onPress} style={{ justifyContent: 'center', alignItems: 'center', width: 80 }}>
            <Animated.View style={{ transform: [{ scale }] }}>
                <Ionicons name="arrow-undo" size={24} color="#34d399" />
            </Animated.View>
        </TouchableOpacity>
    );
};

export default function MessagePage() {
    const [session, setSession] = React.useState<Session | null>(null);
    const [input, setInput] = React.useState("");
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [replyingTo, setReplyingTo] = React.useState<Message | null>(null);
    const [hoveredMessageId, setHoveredMessageId] = React.useState<number | null>(null);
    const swipeableRefs = React.useRef<{ [key: number]: Swipeable | null }>({});

    React.useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        fetchMessages();

        const channel = supabase
            .channel("messages-channel")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "message" },
                () => { fetchMessages(); }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function fetchMessages() {
        const { data: messagesData, error } = await supabase.from("message").select("*").order("created_at", { ascending: false }).limit(50);
        if (error || !messagesData) return;

        const repliedMessageIds = new Set<number>();
        messagesData.forEach(msg => { if (msg.reply_to) repliedMessageIds.add(msg.reply_to); });

        let originalMessages: { [id: number]: Message } = {};
        if (repliedMessageIds.size > 0) {
            const { data: originalData } = await supabase.from("message").select("id, message, email").in("id", Array.from(repliedMessageIds));
            if (originalData) {
                originalData.forEach(msg => { originalMessages[msg.id] = msg as Message; });
            }
        }

        const populatedMessages = messagesData.map(msg => ({
            ...msg,
            original_message: msg.reply_to ? originalMessages[msg.reply_to] : null
        }));
        setMessages(populatedMessages as Message[]);
    }

    async function sendMessage() {
        if (!input.trim() || !session) return;
        const data: { user_id: string; message: string; email: string | undefined; reply_to?: number | null } = {
            user_id: session.user.id,
            message: input,
            email: session.user.email,
        };
        if (replyingTo) data.reply_to = replyingTo.id;

        const { error } = await supabase.schema('public').from("message").insert(data);
        if (error) {
            Alert.alert("Gagal Mengirim Pesan", error.message);
            return;
        }
        setInput("");
        setReplyingTo(null);
    }

    const handleReply = (message: Message) => {
        setReplyingTo(message);
        swipeableRefs.current[message.id]?.close();
    };

    const cancelReply = () => setReplyingTo(null);

    const renderMessage = ({ item }: { item: Message }) => {
        const isMe = item.user_id === session?.user.id;

        const MessageBubble = (
            <View style={{ backgroundColor: isMe ? "#DCF8C6" : "#ECECEC", padding: 10, borderRadius: 12, maxWidth: "75%" }}>
                {item.original_message && (
                    <View className="bg-gray-200/60 p-2 rounded-lg mb-2 border-l-2 border-green-500">
                        <Text className="text-[12px] font-bold text-green-600">{item.original_message.email}</Text>
                        <Text className="text-[14px] text-gray-600" numberOfLines={2}>{item.original_message.message}</Text>
                    </View>
                )}
                <Text className="text-[14px] font-bold">{item.email}</Text>
                <Text className="text-[16px]">{item.message}</Text>
                <Text className="text-[10px] text-neutral-500 mt-1 text-right">{dayjs(item.created_at).format("HH:mm")}</Text>
            </View>
        );

        if (Platform.OS === 'web') {
            return (
                <View
                    onMouseEnter={() => setHoveredMessageId(item.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                    className={`my-1 flex-row items-center ${isMe ? 'justify-end' : 'justify-start'}`}>
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

        // --- LOGIKA UNTUK MOBILE DIPERBAIKI DI SINI ---
        return (
            <Swipeable
                ref={(ref) => (swipeableRefs.current[item.id] = ref)}
                // Langsung trigger reply saat swipe selesai
                onSwipeableOpen={() => handleReply(item)}
                // Gunakan renderLeft atau renderRight berdasarkan posisi pesan
                renderLeftActions={!isMe ? (progress, dragX) => renderActions(progress, dragX, () => handleReply(item)) : undefined}
                renderRightActions={isMe ? (progress, dragX) => renderActions(progress, dragX, () => handleReply(item)) : undefined}
                overshootFriction={8}
            >
                <View style={{ alignSelf: isMe ? 'flex-end' : 'flex-start' }}>{MessageBubble}</View>
            </Swipeable>
        );
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}>
                <SafeAreaView className="flex-1 p-4">
                    <FlatList
                        data={messages}
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
                            <Button title="Send" onPress={sendMessage} disabled={!input.trim()} />
                        </View>
                    </View>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </GestureHandlerRootView>
    );
}