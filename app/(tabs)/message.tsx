// app/(tabs)/message.tsx
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
} from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import dayjs from 'dayjs';

import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchMessages, sendMessage as sendMessageThunk } from '../../features/message/messageSlice';

type Message = {
  id: number;
  user_id: string;
  message: string;
  email: string;
  created_at: string;
};

export default function MessagePage() {
  const dispatch = useDispatch<AppDispatch>();
  const messages = useSelector((state: RootState) => state.message.items);
  const loading = useSelector((state: RootState) => state.message.loading);
  const [session, setSession] = React.useState<Session | null>(null);
  const [input, setInput] = React.useState('');

  // Log whenever messages in redux change
  React.useEffect(() => {
    console.log('[COMPONENT] Redux messages updated. count=', messages.length);
  }, [messages]);

  React.useEffect(() => {
    // get session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        console.log('[COMPONENT] session on mount:', session ? { id: session.user.id, email: session.user.email } : null);
      })
      .catch((error) => {
        console.error('[COMPONENT] Error getting session:', error);
      });

    // initial load via Redux thunk
    console.log('[COMPONENT] dispatching fetchMessages()');
    dispatch(fetchMessages() as any);

    // subscribe to realtime changes on `message` table
    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'message' },
        (payload) => {
          console.log('[COMPONENT][realtime] payload:', payload.eventType, payload);
          // re-fetch messages when anything changes
          dispatch(fetchMessages() as any);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dispatch]);

  const onSend = async () => {
    if (!input.trim()) return;
    console.log('[COMPONENT] dispatching sendMessage with', input);
    try {
      // dispatch the thunk that does the supabase insert
      const action = await dispatch(sendMessageThunk(input) as any);
      // if using unwrap, you can inspect action.payload
      console.log('[COMPONENT] sendMessage action returned', action);
      setInput('');
    } catch (err: any) {
      console.error('[COMPONENT] Error sending message:', err?.message ?? err);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.user_id === session?.user.id;
    return (
      <View
        style={{
          alignSelf: isMe ? 'flex-end' : 'flex-start',
          backgroundColor: isMe ? '#DCF8C6' : '#ECECEC',
          marginVertical: 4,
          padding: 10,
          borderRadius: 12,
          maxWidth: '75%',
        }}
      >
        <Text style={{ fontSize: 14 }}>{item.email}</Text>
        <Text style={{ fontSize: 16 }}>{item.message}</Text>
        <Text style={{ fontSize: 10, color: '#6b7280', marginTop: 8, textAlign: 'right' }}>
          {dayjs(item.created_at).format('HH:mm')}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
    >
      <SafeAreaView style={{ flex: 1, padding: 16 }}>
        {loading && <Text>Loading…</Text>}

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          inverted
          renderItem={renderMessage}
          contentContainerStyle={{ paddingVertical: 10 }}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingVertical: 8 }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#D1D5DB',
              borderRadius: 9999,
              paddingHorizontal: 12,
              paddingVertical: 8,
              marginRight: 8,
            }}
          />
          <Button title="Send" onPress={onSend} />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
