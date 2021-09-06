import sendgrid from '@sendgrid/mail';
import { MailOptions, SendMailOptions } from '../../lib';
import { MailTransport } from './MailTransport';

export function createSendgridTransport({
  name,
  email,
  apiKey,
}: MailOptions): MailTransport {
  sendgrid.setApiKey(apiKey);

  async function send({ to, subject, content }: SendMailOptions) {
    sendgrid.send({
      from: {
        name,
        email,
      },
      to,
      subject,
      html: content,
    });
  }
  return {
    send,
  };
}
