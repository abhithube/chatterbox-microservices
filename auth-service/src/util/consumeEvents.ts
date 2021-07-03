import bcrypt from 'bcrypt';
import crypto from 'crypto';
import consumer from '../config/consumer';
import prisma from '../config/prisma';
import emailUtil from './emailUtil';

const consumeEvents = async (): Promise<void> => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'users', fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value?.toString() || '');
      if (!event.data) return;

      switch (event.type) {
        case 'USER_CREATED':
          {
            const isSocialAccount = !event.data.password;

            if (isSocialAccount) {
              await prisma.user.create({
                data: {
                  sub: event.data.id,
                  username: event.data.username,
                  email: event.data.email,
                  avatarUrl: event.data.avatarUrl,
                  verified: true,
                },
              });
            } else {
              const user = await prisma.user.create({
                data: {
                  sub: event.data.id,
                  username: event.data.username,
                  email: event.data.email,
                  avatarUrl: event.data.avatarUrl,
                  password: bcrypt.hashSync(event.data.password, 10),
                  verificationToken: crypto.randomBytes(16).toString('hex'),
                },
              });

              await emailUtil.sendVerificationEmail(
                user.email,
                user.verificationToken as string
              );
            }
          }
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
