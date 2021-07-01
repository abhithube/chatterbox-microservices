import bcrypt from 'bcrypt';
import consumer from '../config/consumer';
import prisma from '../config/prisma';

const consumeEvents = async (): Promise<void> => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'users', fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value?.toString() || '');
      if (!event.data) return;

      switch (event.type) {
        case 'USER_CREATED':
          await prisma.user.create({
            data: {
              sub: event.data.id,
              username: event.data.username,
              email: event.data.email,
              avatarUrl: event.data.avatarUrl,
              password: event.data.password
                ? bcrypt.hashSync(event.data.password, 10)
                : null,
              verified: !event.data.password,
            },
          });
          break;
        case 'USER_DELETED':
          await prisma.user.delete({
            where: { sub: event.data.id },
          });
          break;
        default:
      }
    },
  });
};

export default consumeEvents;
