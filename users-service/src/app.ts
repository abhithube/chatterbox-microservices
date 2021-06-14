import express from 'express';
import initializeTopics from './config/initializeTopics';
import { errorHandler } from './middleware/errorHandler';
import userRoutes from './routes/userRoutes';

initializeTopics();

const app = express();

app.use(express.json());

app.use('/api', userRoutes);

app.use(errorHandler);

export default app;
