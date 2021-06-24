import { Server, Socket } from 'socket.io';
import { createMessage } from '../controllers/messageController';

const messagesHandler = (io: Server, socket: Socket): void => {
  socket.on('MESSAGE_SENT', async ({ body, userId, topicId }) => {
    try {
      const message = await createMessage({ body, userId, topicId });

      io.in(topicId.toString()).emit('MESSAGE_RECEIVED', message);
    } catch (err) {
      socket.emit('ERROR', { status: err.status, message: err.message });
    }
  });
};

export default messagesHandler;
