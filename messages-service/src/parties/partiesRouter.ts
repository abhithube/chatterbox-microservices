import { RequestWithUser, validationMiddleware } from '@chttrbx/common';
import { Router } from 'express';
import { MessagesService } from '../messages';
import { CreatePartySchema, CreateTopicSchema, JoinPartySchema } from './dto';
import { PartiesService } from './partiesService';

interface PartiesRouterDeps {
  partiesService: PartiesService;
  messagesService: MessagesService;
}

export function createPartiesRouter({
  partiesService,
  messagesService,
}: PartiesRouterDeps) {
  const router = Router();

  router.post(
    '/',
    validationMiddleware(CreatePartySchema),
    async (req, res) => {
      const { body, user } = req as RequestWithUser;

      const party = await partiesService.createParty(body, user);

      res.status(201).json(party);
    }
  );

  router.get('/@me', async (req, res) => {
    const { user } = req as RequestWithUser;

    const parties = await partiesService.getUserParties(user.id);

    res.json(parties);
  });

  router.get('/:id', async (req, res) => {
    const { id } = req.params;

    const party = await partiesService.getParty(id);

    res.json(party);
  });

  router.post(
    '/:id/join',
    validationMiddleware(JoinPartySchema),
    async (req, res) => {
      const { id } = req.params;
      const { token } = req.body;
      const { user } = req as RequestWithUser;

      const party = await partiesService.joinParty(id, token, user);

      res.json(party);
    }
  );

  router.post('/:id/leave', async (req, res) => {
    const { id } = req.params;
    const { user } = req as unknown as RequestWithUser;

    const party = await partiesService.leaveParty(id, user.id);

    res.json(party);
  });

  router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    await partiesService.deleteParty(id);

    res.json();
  });

  router.post(
    '/:id/topics',
    validationMiddleware(CreateTopicSchema),
    async (req, res) => {
      const { id } = req.params;
      const { body } = req;

      const topic = await partiesService.createTopic(body, id);

      res.status(201).json(topic);
    }
  );

  router.get('/:id/topics/:topicId/messages', async (req, res) => {
    const { id, topicId } = req.params;
    const { topicIndex } = req.query;
    const { user } = req as unknown as RequestWithUser;

    const topic = await messagesService.getMessages(
      topicId,
      id,
      user.id,
      topicIndex ? parseInt(topicIndex as string, 10) : undefined
    );

    res.json(topic);
  });

  router.delete('/:id/topics/:topicId', async (req, res) => {
    const { id, topicId } = req.params;

    await partiesService.deleteTopic(topicId, id);

    res.json();
  });

  return router;
}
