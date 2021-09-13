import { Middleware, PayloadAction } from '@reduxjs/toolkit';
import { io, Socket } from 'socket.io-client';
import { addMessage, Message, updateUsersOnline } from '../features/messages';

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

        socket.on('users:read', (users: string[]) => {
          dispatch(updateUsersOnline(users));
        });

        socket.on('message:read', (message: Message) => {
          dispatch(addMessage(message));
        });
        break;
      case 'parties/setActiveParty':
        socket.emit('party:disconnect');

        socket.emit('party:connect', {
          party: action.payload.id,
        });

        break;
      case 'parties/setActiveTopic':
        socket.emit('topic:disconnect');

        socket.emit('topic:connect', {
          topic: action.payload.id,
        });

        break;
      case 'messages/sendMessage':
        socket.emit('message:create', action.payload);
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
