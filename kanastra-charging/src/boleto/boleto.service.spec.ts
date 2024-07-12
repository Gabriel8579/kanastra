import { getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';
import { BoletoService } from './boleto.service';
import { EmailService } from '@/email/email.service';

describe('BoletoService', () => {
  let service: BoletoService;
  let emailService: EmailService;
  let boletoQueue: Queue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoletoService,
        {
          provide: getQueueToken('boleto'),
          useValue: {
            add: jest.fn()
          }
        },
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<BoletoService>(BoletoService);
    emailService = module.get<EmailService>(EmailService);
    boletoQueue = module.get<Queue>(getQueueToken('boleto'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(emailService).toBeDefined();
    expect(boletoQueue).toBeDefined();
  });

  describe('processBilingToBoleto', () => {
    it('should add a job to the boleto queue', async () => {
      const details = {
        debtId: '1',
        debtAmount: '100',
        debtDueDate: '2023-01-01',
        name: 'John Doe',
        email: 'john@example.com',
        governmentId: '12345678901'
      };
      jest.spyOn(boletoQueue, 'add').mockResolvedValue({} as any);

      await service.processBilingToBoleto(details);

      expect(boletoQueue.add).toHaveBeenCalledWith('generateBoleto', details, {
        attempts: 5,
        backoff: 3000,
        removeOnComplete: 1000,
        removeOnFail: 1000
      });
    });
  });

  describe('generateBoleto', () => {
    it('should generate a boleto', async () => {
      const details = {
        debtId: '1',
        debtAmount: '100',
        debtDueDate: '2023-01-01',
        name: 'John Doe',
        email: 'john@example.com',
        governmentId: '12345678901'
      };
      const boleto = await service.generateBoleto(details);

      expect(boleto.linhaDigitavel).toContain(
        details.debtAmount.padStart(10, '0')
      );
      expect(boleto.valor).toBe(1);
      expect(boleto.debtId).toBe(details.debtId);
      expect(boleto.payer.name).toBe(details.name);
    });
  });

  describe('sendMail', () => {
    it('should send an email with boleto details', async () => {
      const boleto = {
        linhaDigitavel: '1049567890123456789012345678901234',
        valor: 100,
        vencimento: new Date('2023-01-01'),
        debtId: '1',
        payer: {
          name: 'John Doe',
          email: 'john@example.com',
          governmentId: '12345678901'
        }
      };

      jest.spyOn(emailService, 'sendEmail').mockResolvedValue();

      await service.sendMail(boleto);

      expect(emailService.sendEmail).toHaveBeenCalledWith({
        to: boleto.payer.email,
        subject: 'Seu boleto foi gerado!',
        body: expect.stringContaining(
          `Olá, ${boleto.payer.name}! Seu boleto foi gerado com sucesso.`
        )
      });
    });
  });
});
