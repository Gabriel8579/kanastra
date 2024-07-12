import { Injectable, Logger } from '@nestjs/common';
import { Email } from './types/email.types';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class EmailService {
  constructor(@InjectQueue('mail') private readonly mailerQueue: Queue) {}

  async sendEmail(details: Email) {
    Logger.verbose(
      `Adding email to queue: ${details.to} with subject: ${details.subject}`
    );

    await this.mailerQueue.add('sendMail', details);
  }

  handleEmailJob(email: Email): Promise<void> {
    Logger.verbose(
      `Sending email to: ${email.to} with subject: ${email.subject}`
    );
    return Promise.resolve();
  }
}
