import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  Pressable,
  Alert,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import dayjs from 'dayjs';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type Message = {
  id: number;
  user_id: string;
  message: string;
  created_at: string;
  email: string;
};

export default function MessagePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
  const [menuVisibleForId, setMenuVisibleForId] = useState<number | null>(null);
  
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: selectedMessage ? '1 Selected' : 'Message',
      headerLeft: () =>
        selectedMessage ? (
          <TouchableOpacity onPress={() => setSelectedMessage(null)} style={{ marginLeft: 10 }}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        ) : null,
      headerRight: () =>
        selectedMessage ? (
          <TouchableOpacity onPress={() => showDeleteConfirm(selectedMessage)} style={{ marginRight: 15 }}>
            <Ionicons name="trash-outline" size={24} color="black" />
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, selectedMessage]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (session) {
      fetchMessages();
      const channelName = `public:message:${session.user.id}`;
      const channel = supabase
        .channel(channelName, { config: { broadcast: { self: true } } })
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'message' },
          () => fetchMessages()
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from('message')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching messages:', error);
      Alert.alert("Error", "Gagal memuat pesan.");
    } else {
      setMessages(data as Message[]);
    }
    setLoading(false);
  }, []);
  
  const sendMessage = async () => {
    if (!input || !input.trim() || !session) return;
    await supabase.from('message').insert({
      user_id: session.user.id,
      email: session.user.email,
      message: input.trim(),
    });
    setInput('');
  };

  const handleDeleteMessage = async (messageId: number) => {
    const { error } = await supabase
      .from('message')
      .delete()
      .eq('id', messageId);

    if (error) {
      Alert.alert("Error", "Gagal menghapus pesan.");
    }
    setSelectedMessage(null);
  };

  const showDeleteConfirm = (item: Message | null) => {
    if (!item || item.user_id !== session?.user.id) return;
    Alert.alert(
      "Hapus Pesan",
      "Apakah Anda yakin ingin menghapus pesan ini?",
      [
        { text: "Batal", style: "cancel", onPress: () => setSelectedMessage(null) },
        { text: "Hapus", onPress: () => handleDeleteMessage(item.id), style: "destructive" }]
    );
  };

  const showWebDeleteConfirm = (item: Message) => {
    if (item.user_id !== session?.user.id) return;
    const confirmed = window.confirm("Apakah Anda yakin ingin menghapus pesan ini?");
    if (confirmed) {
      handleDeleteMessage(item.id);
    }
    setMenuVisibleForId(null);
  };
  
  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.user_id === session?.user.id;
    const isSelected = selectedMessage?.id === item.id;

    if (Platform.OS === 'web') {
      return (
        <View style={[styles.messageRow, isMe ? styles.myRow : styles.theirRow]}>
            <View
                style={{ position: 'relative', width: '100%' }}
                onMouseEnter={() => setHoveredMessageId(item.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
            >
                <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage, {alignSelf: isMe ? 'flex-end' : 'flex-start'}]}>
                    <Text style={styles.authorEmail}>{item.email}</Text>
                    <Text style={styles.messageText}>{item.message}</Text>
                    <Text style={styles.timestamp}>
                        {dayjs(item.created_at).format('HH:mm')}
                    </Text>
                </View>
                {hoveredMessageId === item.id && isMe && (
                    <TouchableOpacity onPress={() => setMenuVisibleForId(menuVisibleForId === item.id ? null : item.id)} style={styles.deleteButton}>
                        <Text style={styles.deleteButtonText}>▼</Text> 
                    </TouchableOpacity>
                )}
                {menuVisibleForId === item.id && (
                    <View style={styles.dropdownMenu}>
                        <TouchableOpacity onPress={(e) => { e.stopPropagation(); showWebDeleteConfirm(item); }} style={styles.menuItem}>
                            <Text>Delete</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
      );
    } else {
      return (
        <Pressable 
            onLongPress={() => { if(isMe) setSelectedMessage(item) }}
            onPress={() => { if(selectedMessage && isMe) setSelectedMessage(item) }}
        >
          {isSelected && <View style={styles.selectionOverlay} />}
          <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage, {alignSelf: isMe ? 'flex-end' : 'flex-start'}]}>
              <Text style={styles.authorEmail}>{item.email}</Text>
              <Text style={styles.messageText}>{item.message}</Text>
              <Text style={styles.timestamp}>
                  {dayjs(item.created_at).format('HH:mm')}
              </Text>
          </View>
        </Pressable>
      );
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  return (
    <Pressable style={{flex: 1}} onPress={() => { setMenuVisibleForId(null); setSelectedMessage(null); }}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
        <SafeAreaView style={styles.flex1}>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.listContent}
            inverted
          />
          <View style={styles.inputContainer}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
              style={styles.textInput}
            />
            <Button title="Send" onPress={sendMessage} disabled={!input || !input.trim()} />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  flex1: { 
    flex: 1, 
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  listContent: { 
    paddingVertical: 20,
  },

  // --- STYLE INPUT DIKEMBALIKAN SEPERTI SEMULA ---
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: 10,
    paddingHorizontal: 10, // Tambahkan padding horizontal
    paddingBottom: 10, // Tambahkan padding bottom
  },
  textInput: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#CCC', 
    borderRadius: 20, 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    marginRight: 10,
  },
  
  messageRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 1, },
  myRow: { justifyContent: 'flex-end' },
  theirRow: { justifyContent: 'flex-start' },
  messageContainer: { padding: 10, borderRadius: 12, maxWidth: '75%', marginVertical: 2, position: 'relative', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: {width: 0, height: 1}, elevation: 1 },
  myMessage: { backgroundColor: '#dcf8c6' },
  theirMessage: { backgroundColor: '#fff' },
  authorEmail: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  messageText: { fontSize: 16 },
  timestamp: { fontSize: 10, color: '#999', marginTop: 4, alignSelf: 'flex-end' },
  deleteButton: { position: 'absolute', top: 5, right: 5, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.05)', zIndex: 10 },
  deleteButtonText: { fontSize: 14, fontWeight: 'bold', color: '#555' },
  dropdownMenu: { position: 'absolute', right: 5, top: 30, backgroundColor: 'white', borderRadius: 8, padding: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, elevation: 5, zIndex: 20 },
  menuItem: { paddingVertical: 8, paddingHorizontal: 15 },

  selectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(52, 152, 219, 0.3)',
    zIndex: 1,
  },
});