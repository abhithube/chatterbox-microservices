import { SendMailOptions } from '../../lib';

export interface MailTransport {
  send(sendMailOptions: SendMailOptions): Promise<void>;
}
