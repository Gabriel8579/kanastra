import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { MailConsumer } from '../mailing.processor';
import { EmailService } from '@/email/email.service';

describe('MailConsumer', () => {
  let consumer: MailConsumer;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailConsumer,
        {
          provide: EmailService,
          useValue: {
            handleEmailJob: jest.fn()
          }
        }
      ]
    }).compile();

    consumer = module.get<MailConsumer>(MailConsumer);
    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
    expect(emailService).toBeDefined();
  });

  describe('sendMail', () => {
    it('should call handleEmailJob with the job data', async () => {
      const job: Job = {
        id: '1',
        data: {
          to: 'test@example.com',
          subject: 'Test Email',
          body: 'This is a test email.'
        }
      } as Job;

      await consumer.sendMail(job);

      expect(emailService.handleEmailJob).toHaveBeenCalledWith(job.data);
    });
  });
});
