import express, { Request, Response } from 'express';
import * as userController from '../controllers/userController';
import asyncHandler from '../middleware/asyncHandler';

const router = express.Router();

router.get(
  '/users/:username',
  asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params;

    const user = await userController.getUserByUsername(username);
    res.status(200).json(user);
  })
);

router.post(
  '/users',
  asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    const user = await userController.createUser({ username, email, password });
    return res.status(201).json(user);
  })
);

router.delete(
  '/users/:username',
  asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params;

    const user = await userController.deleteUserByUsername(username);
    return res.status(200).json(user);
  })
);

export default router;
