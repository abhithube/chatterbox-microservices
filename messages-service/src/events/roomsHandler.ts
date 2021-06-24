import { Server, Socket } from 'socket.io';
import prisma from '../config/prisma';

const roomsHandler = (io: Server, socket: Socket): void => {
  socket.on('JOIN_REQUEST', async ({ userId, topicId }) => {
    const user = await prisma.user.findUnique({ where: { publicId: userId } });
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
  });

  socket.on('LEAVE_REQUEST', async ({ userId, topicId }) => {
    const user = await prisma.user.findUnique({ where: { publicId: userId } });
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
  });
};

export default roomsHandler;
