import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { httpClient } from '../../common';
import { User } from '../auth';

export interface Party {
  id: string;
  name: string;
  inviteToken: string;
  members: User[];
  topics: Topic[];
}

export interface Topic {
  id: string;
  name: string;
}

interface CreatePartyPayload {
  name: string;
}

interface CreateTopicPayload {
  name: string;
}

interface PartiesState {
  data: Party[];
  activeParty: Party | null;
  activeTopic: Topic | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PartiesState = {
  data: [],
  activeParty: null,
  activeTopic: null,
  isLoading: true,
  error: null,
};

export const getParties = createAsyncThunk('parties/getParties', async () => {
  return httpClient.get<Party[]>('/parties/@me');
});

export const createParty = createAsyncThunk(
  'parties/createParty',
  async (payload: CreatePartyPayload) => {
    return httpClient.post<CreatePartyPayload, Party>('/parties', payload);
  }
);

export const createTopic = createAsyncThunk<
  Topic,
  CreateTopicPayload,
  {
    state: RootState;
  }
>('parties/createTopic', async (payload: CreateTopicPayload, { getState }) => {
  const { activeParty } = selectParties(getState());
  return httpClient.post<CreateTopicPayload, Topic>(
    `/parties/${activeParty!.id}/topics`,
    payload
  );
});

const partiesSlice = createSlice({
  name: 'parties',
  initialState,
  reducers: {
    setActiveParty: (state, action: PayloadAction<Party>) => {
      state.activeParty = action.payload;
    },
    setActiveTopic: (state, action: PayloadAction<Topic>) => {
      state.activeTopic = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getParties.pending, state => {
        state.isLoading = true;
      })
      .addCase(getParties.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(getParties.rejected, (state, action) => {
        state.error = action.error.message!;
        state.isLoading = false;
      })
      .addCase(createParty.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      .addCase(createTopic.fulfilled, (state, action) => {
        const partyToUpdate = state.data.find(
          party => party.id === state.activeParty?.id
        );

        partyToUpdate!.topics.push(action.payload);
        state.activeParty = partyToUpdate!;
      });
  },
});

export const { setActiveParty, setActiveTopic } = partiesSlice.actions;

export const selectParties = (state: RootState) => state.parties;

export const partiesReducer = partiesSlice.reducer;
