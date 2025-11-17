import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../supabase';
import { Session } from '@supabase/supabase-js';

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

interface MessageState {
  messages: Message[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: MessageState = {
  messages: [],
  status: 'idle',
  error: null,
};


export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async () => {
    const { data: messagesData, error } = await supabase
        .from("message")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
    
    if (error) throw new Error(error.message);
    if (!messagesData) return [] as Message[];

    // Logika untuk mengambil balasan (reply)
    const repliedMessageIds = new Set<number>();
    messagesData.forEach(msg => {
        if (msg.reply_to) repliedMessageIds.add(msg.reply_to);
    });

    let originalMessages: { [id: number]: Message } = {};
    if (repliedMessageIds.size > 0) {
        const { data: originalData } = await supabase
            .from("message")
            .select("id, message, email")
            .in("id", Array.from(repliedMessageIds));

        if (originalData) {
            originalData.forEach(msg => {
                originalMessages[msg.id] = msg as Message;
            });
        }
    }

    const populatedMessages = messagesData.map(msg => ({
        ...msg,
        original_message: msg.reply_to ? originalMessages[msg.reply_to] : null
    }));

    return populatedMessages as Message[];
  }
);

interface SendMessageArgs {
  input: string;
  session: Session;
  replyingTo: Message | null;
}

// Buat AsyncThunk untuk SEND Message
// Ini akan menggantikan fungsi sendMessage() di komponen Anda
export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ input, session, replyingTo }: SendMessageArgs) => {
    const data = {
        user_id: session.user.id,
        message: input,
        email: session.user.email as string,
        reply_to: replyingTo ? replyingTo.id : null,
    };
    
    const { data: newMessages, error } = await supabase
        .from("message")
        .insert(data)
        .select();

    if (error) throw new Error(error.message);
    
    // Kita return data baru, meskipun subscription akan fetch ulang
    // Ini bisa dipakai untuk 'optimistic update' nanti
    return newMessages?.[0] as Message; 
  }
);

// Buat Slice
const messageSlice = createSlice({
  name: 'messages',
  initialState,
  // 'reducers' untuk aksi sinkron biasa (tidak kita pakai sekarang)
  reducers: {},
  // 'extraReducers' untuk menangani aksi dari createAsyncThunk
  extraReducers: (builder) => {
    builder
      // Kasus untuk fetchMessages
      .addCase(fetchMessages.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMessages.fulfilled, (state, action: PayloadAction<Message[]>) => {
        state.status = 'succeeded';
        state.messages = action.payload; // Masukkan data pesan ke state
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Gagal mengambil pesan';
      })
      // Kasus untuk sendMessage (tidak mengubah state, karena kita andalkan subscription)
      .addCase(sendMessage.fulfilled, (state, action) => {
        // Kita bisa saja menambahkan 'action.payload' ke 'state.messages' di sini
        // Tapi karena Anda pakai real-time subscription, kita biarkan
        // subscription yang mentrigger fetchMessages() agar data selalu sinkron.
      });
  },
});

export default messageSlice.reducer;