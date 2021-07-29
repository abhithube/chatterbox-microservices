import * as SMTPTransport from 'nodemailer/lib/smtp-transport';

export interface MailOptions {
  transport: string | SMTPTransport.Options;
  defaults?: SMTPTransport.Options;
}
