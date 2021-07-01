import express, { Request, Response } from 'express';
import { createUser, deleteUser, getUser } from '../controllers/userController';
import asyncHandler from '../middleware/asyncHandler';
import authHandler from '../middleware/authHandler';
import { RequestWithAuth } from '../types';

const router = express.Router();

router.get(
  '/users/me',
  authHandler,
  asyncHandler(async (req: RequestWithAuth, res: Response) => {
    const { payload } = req;

    const user = await getUser(payload?.sub as string);
    res.status(200).json(user);
  })
);

router.get(
  '/users/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await getUser(id);
    res.status(200).json(user);
  })
);

router.post(
  '/users',
  asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    const user = await createUser({ username, email, password });
    return res.status(201).json(user);
  })
);

router.delete(
  '/users/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await deleteUser(id);
    return res.status(200).json(user);
  })
);

export default router;
