import express from 'express';
import {
  createTopic,
  deleteTopic,
  getAllPartyTopics,
  getTopic,
} from '../controllers/topicController';
import asyncHandler from '../middleware/asyncHandler';

const router = express.Router();

router.get(
  '/parties/:partyId/topics',
  asyncHandler(async (req, res) => {
    const { partyId } = req.params;

    const topics = await getAllPartyTopics(parseInt(partyId, 10));
    return res.status(200).json(topics);
  })
);

router.get(
  '/topics/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const topic = await getTopic(parseInt(id, 10));
    return res.status(200).json(topic);
  })
);

router.post(
  '/topics',
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
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const topic = await deleteTopic(parseInt(id, 10));
    return res.status(200).json(topic);
  })
);

export default router;
