import express from 'express';
import * as topicController from '../controllers/topicController';
import asyncHandler from '../middleware/asyncHandler';

const router = express.Router();

router.get(
  '/topics',
  asyncHandler(async (req, res) => {
    const topics = await topicController.getAllTopics();
    return res.status(200).json(topics);
  })
);

router.get(
  '/topics/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const topic = await topicController.getTopic(parseInt(id, 10));
    return res.status(200).json(topic);
  })
);

router.post(
  '/topics',
  asyncHandler(async (req, res) => {
    const { name, partyId } = req.body;

    const topic = await topicController.createTopic({
      name,
      partyId: parseInt(partyId, 10),
    });
    return res.status(201).json(topic);
  })
);

router.delete(
  '/topics/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const topic = await topicController.deleteTopic(parseInt(id, 10));
    return res.status(200).json(topic);
  })
);

export default router;
