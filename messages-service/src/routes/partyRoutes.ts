import express from 'express';
import {
  createParty,
  deleteParty,
  getAllParties,
  getParty,
  joinParty,
  leaveParty,
} from '../controllers/partyController';
import { getAllPartyTopics } from '../controllers/topicController';
import asyncHandler from '../middleware/asyncHandler';

const router = express.Router();

router.get(
  '/parties',
  asyncHandler(async (_, res) => {
    const parties = await getAllParties();
    return res.status(200).json(parties);
  })
);

router.get(
  '/parties/:partyId/topics',
  asyncHandler(async (req, res) => {
    const { partyId } = req.params;

    const topics = await getAllPartyTopics(parseInt(partyId, 10));
    return res.status(200).json(topics);
  })
);

router.get(
  '/parties/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const party = await getParty(parseInt(id, 10));
    return res.status(200).json(party);
  })
);

router.post(
  '/parties',
  asyncHandler(async (req, res) => {
    const { name, userId } = req.body;

    const party = await createParty({ name, userId });
    return res.status(201).json(party);
  })
);

router.post(
  '/parties/:id/join',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    const party = await joinParty(parseInt(id, 10), userId);
    return res.status(200).json(party);
  })
);

router.post(
  '/parties/:id/leave',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    const party = await leaveParty(parseInt(id, 10), userId);
    return res.status(200).json(party);
  })
);

router.delete(
  '/parties/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const party = await deleteParty(parseInt(id, 10));
    return res.status(200).json(party);
  })
);

export default router;
