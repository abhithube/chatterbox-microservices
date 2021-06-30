import express from 'express';
import initializeTopics from './config/initializeTopics';
import errorHandler from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';

initializeTopics();

const app = express();

app.use(express.json());

app.use('/api', authRoutes);

app.use(errorHandler);

export default app;
