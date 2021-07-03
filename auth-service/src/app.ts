import cors from 'cors';
import express from 'express';
import initializeTopics from './config/initializeTopics';
import errorHandler from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import consumeEvents from './util/consumeEvents';

initializeTopics();
consumeEvents();

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use('/api', authRoutes);

app.use(errorHandler);

export default app;
