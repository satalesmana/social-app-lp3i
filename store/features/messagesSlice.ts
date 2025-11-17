import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase'; 


export type Message = {
    id: number; 
    user_id: string;
    message: string;
    email: string;
    created_at: string;
};

// Tipe untuk argumen 'sendMessage'
type NewMessageArg = {
    user_id: string | undefined;
    message: string;
    email: string | undefined;
}

// Tipe untuk state slice
interface MessagesState {
  items: Message[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}


const initialState: MessagesState = {
  items: [],
  loading: 'idle',
  error: null,
};


 // THUNK untuk mengambil (fetch) semua pesan
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (_, thunkAPI) => {
    const { data, error } = await supabase
      .schema('public')
      .from("message")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
    
    return data as Message[]; 
  }
);


 // THUNK untuk mengirim (post) pesan baru
export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (newMessage: NewMessageArg, thunkAPI) => {
    const { data, error } = await supabase
      .schema('public')
      .from("message")
      .insert(newMessage)
      .select(); 
    if (error) {
      console.error("Error sending message:", error);
      return thunkAPI.rejectWithValue(error.message);
    }
    
    return data ? data[0] as Message : null;
  }
);

// BUAT SLICE (State, Reducers, ExtraReducers)
export const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  // Reducer sinkron (untuk Realtime)
  reducers: {
    messageReceived: (state, action: PayloadAction<Message>) => {
      if (!state.items.find(item => item.id === action.payload.id)) {
        state.items.unshift(action.payload); 
      }
    },
    // Untuk pesan di-UPDATE
    messageUpdated: (state, action: PayloadAction<Message>) => {
      state.items = state.items.map(item => 
        item.id === action.payload.id ? action.payload : item
      );
    },
    // Untuk pesan di-DELETE
    messageDeleted: (state, action: PayloadAction<{ old: { id: number } }>) => {
      state.items = state.items.filter(item => item.id !== action.payload.old.id);
    },
  },

  // Reducer asinkron (untuk Thunks)
  extraReducers: (builder) => {
    builder
      // Untuk fetchMessages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string; 
      })

      // Untuk sendMessage
      .addCase(sendMessage.pending, (state) => {
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = `Failed to send message: ${action.payload as string}`;
      });
  },
});

// EKSPOR ACTION DAN REDUCER

export const { messageReceived, messageUpdated, messageDeleted } = messagesSlice.actions;

export default messagesSlice.reducer;