import { Email } from '@/email/types/email.types';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bullmq';
import { EmailService } from 'src/email/email.service';

@Processor('mail')
export class MailConsumer {
  constructor(private readonly mailerService: EmailService) {}

  @Process('sendMail')
  async sendMail(job: Job<Email>) {
    await this.mailerService.handleEmailJob(job.data);
  }
}
