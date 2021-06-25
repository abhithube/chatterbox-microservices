import express from 'express';
import errorHandler from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';

const app = express();

app.use(express.json());

app.use('/api', authRoutes);

app.use(errorHandler);

export default app;
