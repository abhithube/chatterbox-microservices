import express from 'express';
import { getAllTopicMessages } from '../controllers/messageController';
import {
  createTopic,
  deleteTopic,
  getTopic,
} from '../controllers/topicController';
import asyncHandler from '../middleware/asyncHandler';
import { apiAuthHandler as authHandler } from '../middleware/authHandler';

const router = express.Router();

router.get(
  '/topics/:id',
  authHandler,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const topic = await getTopic(parseInt(id, 10));
    return res.status(200).json(topic);
  })
);

router.get(
  '/topics/:topicId/messages',
  authHandler,
  asyncHandler(async (req, res) => {
    const { topicId } = req.params;

    const messages = await getAllTopicMessages(parseInt(topicId, 10));
    return res.status(200).json(messages);
  })
);

router.post(
  '/topics',
  authHandler,
  asyncHandler(async (req, res) => {
    const { name, partyId } = req.body;

    const topic = await createTopic({
      name,
      partyId: parseInt(partyId, 10),
    });
    return res.status(201).json(topic);
  })
);

router.delete(
  '/topics/:id',
  authHandler,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const topic = await deleteTopic(parseInt(id, 10));
    return res.status(200).json(topic);
  })
);

export default router;
