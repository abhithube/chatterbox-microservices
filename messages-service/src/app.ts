import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import initializeTopics from './config/initializeTopics';
import messagesHandler from './events/messagesHandler';
import roomsHandler from './events/roomsHandler';
import { socketsAuthHandler as authHandler } from './middleware/authHandler';
import errorHandler from './middleware/errorHandler';
import partyRoutes from './routes/partyRoutes';
import topicRoutes from './routes/topicRoutes';
import { SocketWithAuth } from './types';
import consumeEvents from './util/consumeEvents';

initializeTopics();
consumeEvents();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

io.use(authHandler);

io.on('connection', (socket: SocketWithAuth) => {
  roomsHandler(io, socket);
  messagesHandler(io, socket);
});

app.use(express.json());

app.use('/api', partyRoutes, topicRoutes);

app.use(errorHandler);

export default httpServer;
