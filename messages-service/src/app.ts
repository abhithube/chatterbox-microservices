import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import initializeTopics from './config/initializeTopics';
import prisma from './config/prisma';
import errorHandler from './middleware/errorHandler';
import partyRoutes from './routes/partyRoutes';
import topicRoutes from './routes/topicRoutes';
import consumeEvents from './util/consumeEvents';

initializeTopics();
consumeEvents();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

io.on('connection', (socket: Socket) => {
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

    socket.join(topic.id.toString());
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

    socket.leave(topic.id.toString());
  });

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
});

app.use(express.json());

app.use('/api', partyRoutes, topicRoutes);

app.use(errorHandler);

export default httpServer;
