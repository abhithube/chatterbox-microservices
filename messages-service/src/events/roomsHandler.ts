import { Server } from 'socket.io';
import prisma from '../config/prisma';
import { SocketWithAuth } from '../types';

const roomsHandler = (io: Server, socket: SocketWithAuth): void => {
  const userId = socket.payload?.sub as string;

  socket.on('JOIN_REQUEST', async ({ topicId }) => {
    try {
      const user = await prisma.user.findUnique({
        where: { publicId: userId },
      });
      if (!user) {
        socket.emit('ERROR', { status: 404, message: 'User not found' });
        return;
      }

      const topic = await prisma.topic.findUnique({ where: { id: topicId } });
      if (!topic) {
        socket.emit('ERROR', { status: 404, message: 'Topic not found' });
        return;
      }

      socket.join(topicId.toString());
    } catch (err) {
      socket.emit('ERROR', { status: 500, message: 'Internal server error' });
    }
  });

  socket.on('LEAVE_REQUEST', async ({ topicId }) => {
    try {
      const user = await prisma.user.findUnique({
        where: { publicId: userId },
      });
      if (!user) {
        socket.emit('ERROR', { status: 404, message: 'User not found' });
        return;
      }

      const topic = await prisma.topic.findUnique({ where: { id: topicId } });
      if (!topic) {
        socket.emit('ERROR', { status: 404, message: 'Topic not found' });
        return;
      }

      socket.leave(topicId.toString());
    } catch (err) {
      socket.emit('ERROR', { status: 500, message: 'Internal server error' });
    }
  });
};

export default roomsHandler;
