import 'dotenv/config';
import express from 'express';
import { errorHandler } from './middleware/errorHandler';
import userRoutes from './routes/userRoutes';

const app = express();

app.use(express.json());

app.use(userRoutes);

app.use(errorHandler);

export default app;
