import { Inject, Injectable } from '@nestjs/common';
import { createTransport, SendMailOptions, Transporter } from 'nodemailer';
import { MailOptions } from './interfaces';

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor(@Inject('MAIL_OPTIONS') { transport, defaults }: MailOptions) {
    this.transporter = createTransport(transport, defaults);
  }

  async send(options: SendMailOptions): Promise<void> {
    this.transporter.sendMail(options);
  }
}
