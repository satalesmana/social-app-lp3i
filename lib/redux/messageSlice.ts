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

// Tipe untuk state slice
interface MessageState {
  messages: Message[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Tipe untuk argumen sendMessage
interface SendMessageArgs {
  input: string;
  session: Session;
  replyingTo: Message | null;
}

const initialState: MessageState = {
  messages: [],
  status: 'idle',
  error: null,
};

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async () => {
    console.log("REDUX THUNK: Menjalankan 'fetchMessages'..."); 
    
    const { data: messagesData, error } = await supabase
        .from("message")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
    
    if (error) {
      console.error("REDUX THUNK ERROR (fetch):", error.message);
      throw new Error(error.message);
    }
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

    console.log(`REDUX THUNK: 'fetchMessages' selesai, ${populatedMessages.length} pesan ditemukan.`);
    return populatedMessages as Message[];
  }
);


export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ input, session, replyingTo }: SendMessageArgs) => {
    console.log("REDUX THUNK: Menjalankan 'sendMessage'...", { input, replyingToId: replyingTo?.id });

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

    if (error) {
      console.error("REDUX THUNK ERROR (send):", error.message);
      throw new Error(error.message);
    }
    
    console.log("REDUX THUNK: 'sendMessage' berhasil, data baru:", newMessages?.[0]);
    return newMessages?.[0] as Message; 
  }
);

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Kasus untuk fetchMessages
      .addCase(fetchMessages.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMessages.fulfilled, (state, action: PayloadAction<Message[]>) => {
        state.status = 'succeeded';
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Gagal mengambil pesan';
      })
      // Kasus untuk sendMessage
      .addCase(sendMessage.pending, (state) => {
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        // Tidak perlu menambahkan ke state 'messages' secara manual
        // karena subscription Anda akan memicu 'fetchMessages'
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.error.message || 'Gagal mengirim pesan';
      });
  },
});

export default messageSlice.reducer;