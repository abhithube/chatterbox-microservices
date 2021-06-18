import express, { Request, Response } from 'express';
import { createUser, deleteUser, getUser } from '../controllers/userController';
import asyncHandler from '../middleware/asyncHandler';

const router = express.Router();

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
