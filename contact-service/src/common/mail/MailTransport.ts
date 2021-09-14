import { SendMailOptions } from './interfaces';

export interface MailTransport {
  send(sendMailOptions: SendMailOptions): Promise<void>;
}
