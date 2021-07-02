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
import { apiAuthHandler as authHandler } from '../middleware/authHandler';
import { RequestWithAuth } from '../types';

const router = express.Router();

router.get(
  '/parties',
  authHandler,
  asyncHandler(async (_, res) => {
    const parties = await getAllParties();
    return res.status(200).json(parties);
  })
);

router.get(
  '/parties/:partyId/topics',
  authHandler,
  asyncHandler(async (req, res) => {
    const { partyId } = req.params;

    const topics = await getAllPartyTopics(parseInt(partyId, 10));
    return res.status(200).json(topics);
  })
);

router.get(
  '/parties/:id',
  authHandler,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const party = await getParty(parseInt(id, 10));
    return res.status(200).json(party);
  })
);

router.post(
  '/parties',
  authHandler,
  asyncHandler(async (req: RequestWithAuth, res) => {
    const { payload } = req;
    const { name } = req.body;

    const party = await createParty({ name, userId: payload?.sub as string });
    return res.status(201).json(party);
  })
);

router.post(
  '/parties/:id/join',
  authHandler,
  asyncHandler(async (req: RequestWithAuth, res) => {
    const { id } = req.params;
    const { payload } = req;

    const party = await joinParty(parseInt(id, 10), payload?.sub as string);
    return res.status(200).json(party);
  })
);

router.post(
  '/parties/:id/leave',
  authHandler,
  asyncHandler(async (req: RequestWithAuth, res) => {
    const { id } = req.params;
    const { payload } = req;

    const party = await leaveParty(parseInt(id, 10), payload?.sub as string);
    return res.status(200).json(party);
  })
);

router.delete(
  '/parties/:id',
  authHandler,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const party = await deleteParty(parseInt(id, 10));
    return res.status(200).json(party);
  })
);

export default router;
