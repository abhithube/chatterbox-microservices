import { Options } from 'nodemailer/lib/smtp-transport';

export interface MailOptions {
  transport: string | Options;
  defaults?: Options;
}
