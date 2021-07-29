import { Inject, Injectable } from '@nestjs/common';
import { createTransport, SendMailOptions, Transporter } from 'nodemailer';
import { MailOptions } from './interfaces/mail-options.interface';

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor(@Inject('MAIL_OPTIONS') { transport, defaults }: MailOptions) {
    this.transporter = createTransport(transport, defaults);
  }

  async sendMail(sendMailOptions: SendMailOptions): Promise<void> {
    this.transporter.sendMail(sendMailOptions);
  }
}
