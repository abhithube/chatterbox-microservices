import { Middleware, PayloadAction } from '@reduxjs/toolkit';
import { io, Socket } from 'socket.io-client';
import {
  addMessage,
  Message,
  updateUsersOnline,
} from '../features/messages/messagesSlice';

export const socketMiddleware: Middleware = ({ dispatch }) => {
  let socket: Socket;
  return next => (action: PayloadAction<any>) => {
    switch (action.type) {
      case 'auth/getAuth/fulfilled':
      case 'auth/signIn/fulfilled':
        socket = io(process.env.REACT_APP_SERVER_URL!, {
          extraHeaders: {
            authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        socket.on('connected_users', (users: string[]) => {
          dispatch(updateUsersOnline(users));
        });

        socket.on('receive_message', (message: Message) => {
          dispatch(addMessage(message));
        });
        break;
      case 'parties/setActiveParty':
        socket.emit('leave_party');

        socket.emit('join_party', {
          party: action.payload.id,
        });

        break;
      case 'parties/setActiveTopic':
        socket.emit('leave_topic');

        socket.emit('join_topic', {
          topic: action.payload.id,
        });

        break;
      case 'messages/sendMessage':
        socket.emit('send_message', action.payload);
        break;
      case 'auth/getAuth/rejected':
      case 'auth/signOut/fulfilled':
        socket?.disconnect();
        break;
      default:
        break;
    }

    next(action);
  };
};
