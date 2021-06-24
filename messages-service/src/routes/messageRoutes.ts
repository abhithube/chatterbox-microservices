import express from 'express';
import {
  createMessage,
  deleteMessage,
  getAllTopicMessages,
} from '../controllers/messageController';
import asyncHandler from '../middleware/asyncHandler';

const router = express.Router();

router.get(
  '/topics/:topicId/messages',
  asyncHandler(async (req, res) => {
    const { topicId } = req.params;

    const messages = await getAllTopicMessages(parseInt(topicId, 10));
    return res.status(200).json(messages);
  })
);
router.post(
  '/messages',
  asyncHandler(async (req, res) => {
    const { body, userId, topicId } = req.body;

    const message = await createMessage({
      body,
      userId,
      topicId: parseInt(topicId, 10),
    });
    return res.status(201).json(message);
  })
);

router.delete(
  '/messages/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const message = await deleteMessage(parseInt(id, 10));
    return res.status(200).json(message);
  })
);

export default router;
