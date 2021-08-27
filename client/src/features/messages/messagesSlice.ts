import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { httpClient } from '../../common/httpClient';
import { User } from '../login/authSlice';
import { selectParties } from '../parties/partiesSlice';

export interface Message {
  id: string;
  topicIndex: number;
  body: string;
  user: User;
  createdAt: Date;
}

interface GetMessagesPayload {
  topicIndex?: number;
}

interface CreateMessagePayload {
  body: string;
}

interface MessagesState {
  data: Message[];
  usersOnline: string[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MessagesState = {
  data: [],
  usersOnline: [],
  isLoading: true,
  error: null,
};

export const getMessages = createAsyncThunk<
  Message[],
  GetMessagesPayload,
  {
    state: RootState;
  }
>('messages/getMessages', async (payload, { getState }) => {
  const { activeTopic } = selectParties(getState());

  const query =
    `?topicId=${activeTopic!.id}` +
    (payload.topicIndex ? `&syncId=${payload.topicIndex}` : '');

  return httpClient.get<Message[]>(`/messages${query}`);
});

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    updateUsersOnline: (state, action: PayloadAction<string[]>) => {
      state.usersOnline = action.payload;
    },
    sendMessage: (_state, _action: PayloadAction<CreateMessagePayload>) => {},
    addMessage: (state, action: PayloadAction<Message>) => {
      state.data = [action.payload, ...state.data];
    },
    clearMessages: state => {
      state.data = [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getMessages.pending, state => {
        state.isLoading = true;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.data.push(...action.payload);
        state.isLoading = false;
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.error = action.error.message!;
        state.isLoading = false;
      });
  },
});

export const { updateUsersOnline, sendMessage, addMessage, clearMessages } =
  messagesSlice.actions;

export const selectMessages = (state: RootState) => state.messages;

export default messagesSlice.reducer;
