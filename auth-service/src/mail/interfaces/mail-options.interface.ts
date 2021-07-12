import * as SMTPTransport from 'nodemailer/lib/smtp-transport';

export interface MailOptions {
  defaults?: SMTPTransport.Options;
  transport: string | SMTPTransport.Options;
}
