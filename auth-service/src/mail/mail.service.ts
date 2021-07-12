import { Inject, Injectable } from '@nestjs/common';
import {
  createTransport,
  SendMailOptions,
  SentMessageInfo,
  Transporter,
} from 'nodemailer';
import { MailOptions } from './interfaces/mail-options.interface';

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor(@Inject('MAIL_OPTIONS') private options: MailOptions) {
    this.transporter = createTransport(options.transport, options.defaults);
  }

  public async sendMail(
    sendMailOptions: SendMailOptions,
  ): Promise<SentMessageInfo> {
    this.transporter.sendMail(sendMailOptions);
  }
}
