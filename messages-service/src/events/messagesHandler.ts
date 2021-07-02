import { Server } from 'socket.io';
import { createMessage } from '../controllers/messageController';
import { SocketWithAuth } from '../types';

const messagesHandler = (io: Server, socket: SocketWithAuth): void => {
  const userId = socket.payload?.sub as string;

  socket.on('MESSAGE_SENT', async ({ body, topicId }) => {
    try {
      const message = await createMessage({ body, userId, topicId });

      io.in(topicId.toString()).emit('MESSAGE_RECEIVED', message);
    } catch (err) {
      socket.emit('ERROR', { status: 500, message: 'Internal server error' });
    }
  });
};

export default messagesHandler;
