import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bull';
import { ChargeConsumer } from '../charge.processor';
import { BoletoService } from '@/boleto/boleto.service';
import { BillingJob } from '@/util/types/billing.type';

describe('ChargeConsumer', () => {
  let consumer: ChargeConsumer;
  let boletoService: BoletoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChargeConsumer,
        {
          provide: BoletoService,
          useValue: {
            processBilingToBoleto: jest.fn()
          }
        }
      ]
    }).compile();

    consumer = module.get<ChargeConsumer>(ChargeConsumer);
    boletoService = module.get<BoletoService>(BoletoService);
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
    expect(boletoService).toBeDefined();
  });

  describe('emitCharge', () => {
    it('should process each billing item in the job data', async () => {
      const job: Job<BillingJob> = {
        id: 1,
        data: {
          bills: [
            { debtId: '1', amount: 100 },
            { debtId: '2', amount: 200 }
          ]
        },
        progress: jest.fn()
      } as unknown as Job<BillingJob>;

      await consumer.emitCharge(job);

      expect(boletoService.processBilingToBoleto).toHaveBeenCalledTimes(
        job.data.bills.length
      );
      expect(job.progress).toHaveBeenCalledTimes(job.data.bills.length);
    });
  });
});
