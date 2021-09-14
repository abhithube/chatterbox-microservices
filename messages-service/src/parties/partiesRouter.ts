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

    const parties = await partiesService.getUserParties(user);

    res.json(parties);
  });

  router.get('/:id', async (req, res) => {
    const { params } = req;

    const party = await partiesService.getParty(params.id);

    res.json(party);
  });

  router.post(
    '/:id/join',
    validationMiddleware(JoinPartySchema),
    async (req, res) => {
      const { params, body, user } = req as RequestWithUser;

      const party = await partiesService.joinParty(params.id, body, user);

      res.json(party);
    }
  );

  router.post('/:id/leave', async (req, res) => {
    const { params, user } = req as unknown as RequestWithUser;

    const party = await partiesService.leaveParty(params.id, user);

    res.json(party);
  });

  router.delete('/:id', async (req, res) => {
    const { params, user } = req as unknown as RequestWithUser;

    await partiesService.deleteParty(params.id, user);

    res.json();
  });

  router.post(
    '/:id/topics',
    validationMiddleware(CreateTopicSchema),
    async (req, res) => {
      const { params, body } = req;

      const topic = await partiesService.createTopic(body, params.id);

      res.status(201).json(topic);
    }
  );

  router.get('/:id/topics/:topicId/messages', async (req, res) => {
    const { params, query, user } = req as unknown as RequestWithUser;

    const topic = await messagesService.getMessages(
      params.topicId,
      params.id,
      user.id,
      query.topicIndex ? parseInt(query.topicIndex as string, 10) : undefined
    );

    res.json(topic);
  });

  router.delete('/:id/topics/:topicId', async (req, res) => {
    const { params } = req;

    await partiesService.deleteTopic(params.topicId, params.id);

    res.json();
  });

  return router;
}
