import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from '../features/auth';
import { messagesReducer } from '../features/messages';
import { partiesReducer } from '../features/parties';
import { socketMiddleware } from './socketMiddleware';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    parties: partiesReducer,
    messages: messagesReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(socketMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// export default store;
