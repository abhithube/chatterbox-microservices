import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { httpClient } from '../../common';
import { User } from '../auth';
import { selectParties } from '../parties';

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
  messageReady: boolean;
  error: string | null;
}

const initialState: MessagesState = {
  data: [],
  usersOnline: [],
  isLoading: true,
  messageReady: false,
  error: null,
};

export const getMessages = createAsyncThunk<
  Message[],
  GetMessagesPayload,
  {
    state: RootState;
  }
>('messages/getMessages', async (payload, { getState }) => {
  const { activeParty, activeTopic } = selectParties(getState());

  return httpClient.get<Message[]>(
    `/messages-service/parties/${activeParty?.id}/topics/${
      activeTopic?.id
    }/messages${payload.topicIndex ? `?topicIndex=${payload.topicIndex}` : ''}`
  );
});

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    updateUsersOnline: (state, action: PayloadAction<string[]>) => {
      state.usersOnline = action.payload;
    },
    setMessageReady: (state, action: PayloadAction<boolean>) => {
      state.messageReady = action.payload;
    },
    sendMessage: (_state, _action: PayloadAction<CreateMessagePayload>) => {},
    addMessage: (state, action: PayloadAction<Message>) => {
      state.data = [action.payload, ...state.data];
    },
    clearMessages: (state) => {
      state.data = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMessages.pending, (state) => {
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

export const {
  updateUsersOnline,
  setMessageReady,
  sendMessage,
  addMessage,
  clearMessages,
} = messagesSlice.actions;

export const selectMessages = (state: RootState) => state.messages;

export const messagesReducer = messagesSlice.reducer;
