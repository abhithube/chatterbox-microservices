import 'dotenv/config';
import express from 'express';

const app = express();

app.get('/', (_, res) => {
  res.status(200).json({ message: 'Hello world' });
});

export default app;
