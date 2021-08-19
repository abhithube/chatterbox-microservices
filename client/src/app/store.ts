import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/login/authSlice';
import messagesReducer from '../features/messages/messagesSlice';
import partiesReducer from '../features/parties/partiesSlice';
import { socketMiddleware } from './socketMiddleware';

const store = configureStore({
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

export default store;
