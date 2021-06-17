import express from 'express';
import * as partyController from '../controllers/partyController';
import asyncHandler from '../middleware/asyncHandler';

const router = express.Router();

router.get(
  '/parties',
  asyncHandler(async (_, res) => {
    const parties = await partyController.getAllParties();
    return res.status(200).json(parties);
  })
);

router.get(
  '/parties/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const party = await partyController.getParty(parseInt(id, 10));
    return res.status(200).json(party);
  })
);

router.post(
  '/parties',
  asyncHandler(async (req, res) => {
    const { name, userId } = req.body;

    const party = await partyController.createParty({ name, userId });
    return res.status(201).json(party);
  })
);

router.post(
  '/parties/:id/join',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    const party = await partyController.joinParty(parseInt(id, 10), userId);
    return res.status(200).json(party);
  })
);

router.post(
  '/parties/:id/leave',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    const party = await partyController.leaveParty(parseInt(id, 10), userId);
    return res.status(200).json(party);
  })
);

router.delete(
  '/parties/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const party = await partyController.deleteParty(parseInt(id, 10));
    return res.status(200).json(party);
  })
);

export default router;
