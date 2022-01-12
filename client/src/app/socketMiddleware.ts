import { Middleware, PayloadAction } from '@reduxjs/toolkit';
import { io, Socket } from 'socket.io-client';
import {
  addMessage,
  Message,
  setMessageReady,
  updateUsersOnline,
} from '../features/messages';

export const socketMiddleware: Middleware = ({ dispatch }) => {
  let socket: Socket;
  return (next) => (action: PayloadAction<any>) => {
    switch (action.type) {
      case 'auth/getAuth/fulfilled':
      case 'auth/signIn/fulfilled':
        socket = io(process.env.REACT_APP_SERVER_URL!, {
          path: '/messages-service/socket.io',
          extraHeaders: {
            authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        socket.on('error', (err) => {
          if (err.type === 'topic:connection') {
            socket.emit(
              'topic:connect',
              {
                topic: err.data,
              },
              () => {
                dispatch(setMessageReady(true));
              }
            );
          }
        });

        socket.on('users:read', (users: string[]) => {
          dispatch(updateUsersOnline(users));
        });

        socket.on('message:read', (message: Message) => {
          dispatch(addMessage(message));
        });
        break;
      case 'parties/getActiveParty/fulfilled':
        socket.emit(
          'party:connect',
          {
            party: action.payload.id,
          },
          () => {}
        );

        break;
      case 'parties/setActiveTopic':
        socket.emit(
          'topic:connect',
          {
            topic: action.payload.id,
          },
          () => {
            dispatch(setMessageReady(true));
          }
        );

        break;
      case 'messages/sendMessage':
        socket.emit('message:create', action.payload, () => {
          dispatch(setMessageReady(true));
        });
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
