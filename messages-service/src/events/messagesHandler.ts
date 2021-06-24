import { Server, Socket } from 'socket.io';
import prisma from '../config/prisma';

const messagesHandler = (io: Server, socket: Socket): void => {
  socket.on('MESSAGE_SENT', async payload => {
    const { body, userId, topicId } = payload;

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

    const message = await prisma.message.create({
      data: { body, userId: user.id, topicId },
    });

    io.in(topic.id.toString()).emit('MESSAGE_RECEIVED', message);
  });
};

export default messagesHandler;
