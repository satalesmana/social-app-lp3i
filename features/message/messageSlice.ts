// features/message/messageSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';

export interface MessageItem {
  id: number;
  user_id: string;
  message: string;
  email: string | null;
  created_at: string | null;
}

interface MessageState {
  items: MessageItem[];
  loading: boolean;
  error: string | null;
}

const initialState: MessageState = {
  items: [],
  loading: false,
  error: null,
};

// -----------------------------
// FETCH MESSAGES - with logs
// -----------------------------
export const fetchMessages = createAsyncThunk<MessageItem[], void, { rejectValue: string }>(
  'message/fetchMessages',
  async (_, thunkAPI) => {
    try {
      console.log('[THUNK][fetchMessages] starting fetch');
      const { data, error } = await supabase
        .from<MessageItem>('message')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      console.log('[THUNK][fetchMessages] supabase returned', { dataLength: data?.length, error });
      if (error) return thunkAPI.rejectWithValue(error.message);
      return data ?? [];
    } catch (err: any) {
      console.error('[THUNK][fetchMessages] caught error', err);
      return thunkAPI.rejectWithValue(err.message || 'Failed to fetch messages');
    }
  }
);

// -----------------------------
// SEND MESSAGE - with logs
// -----------------------------
export const sendMessage = createAsyncThunk<MessageItem, string, { rejectValue: string }>(
  'message/sendMessage',
  async (text, thunkAPI) => {
    try {
      console.log('[THUNK][sendMessage] called with:', text);

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('[THUNK][sendMessage] getSession error', sessionError);
        return thunkAPI.rejectWithValue(sessionError.message);
      }
      const session = sessionData.session;
      console.log('[THUNK][sendMessage] session:', session ? { userId: session.user.id, email: session.user.email } : null);

      if (!session) return thunkAPI.rejectWithValue('Not authenticated');

      const row = {
        user_id: session.user.id,
        message: text,
        email: session.user.email,
      };

      const { data, error } = await supabase
        .from<MessageItem>('message')
        .insert(row)
        .select()
        .single();

      console.log('[THUNK][sendMessage] supabase.insert result', { data, error });
      if (error) return thunkAPI.rejectWithValue(error.message);
      return data;
    } catch (err: any) {
      console.error('[THUNK][sendMessage] caught error', err);
      return thunkAPI.rejectWithValue(err.message || 'Failed to send message');
    }
  }
);

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload ?? action.error?.message ?? 'Failed to fetch messages';
      })

      .addCase(sendMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        // add to front
        state.items.unshift(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action: any) => {
        state.error = action.payload ?? action.error?.message ?? 'Failed to send message';
      });
  },
});

export default messageSlice.reducer;
