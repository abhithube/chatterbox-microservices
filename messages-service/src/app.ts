import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import initializeTopics from './config/initializeTopics';
import messagesHandler from './events/messagesHandler';
import roomsHandler from './events/roomsHandler';
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
  roomsHandler(io, socket);
  messagesHandler(io, socket);
});

app.use(express.json());

app.use('/api', partyRoutes, topicRoutes);

app.use(errorHandler);

export default httpServer;
