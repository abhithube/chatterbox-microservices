import express from 'express';
import initializeTopics from './config/initializeTopics';
import errorHandler from './middleware/errorHandler';
import partyRoutes from './routes/partyRoutes';
import topicRoutes from './routes/topicRoutes';
import consumeEvents from './util/consumeEvents';

initializeTopics();
consumeEvents();

const app = express();

app.use(express.json());

app.use('/api', partyRoutes, topicRoutes);

app.use(errorHandler);

export default app;
