import { Test, TestingModule } from '@nestjs/testing';
import { BoletoService } from 'src/boleto/boleto.service';
import { Job } from 'bull';
import { BoletoStatus } from 'src/boleto/types/boleto.types';
import { BoletoConsumer } from '../boleto.processor';
import { BoletoRepository } from '@/boleto/repository/boleto.repository';

describe('BoletoConsumer', () => {
  let consumer: BoletoConsumer;
  let boletoService: BoletoService;
  let boletoRepository: BoletoRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoletoConsumer,
        {
          provide: BoletoService,
          useValue: {
            generateBoleto: jest.fn(),
            sendMail: jest.fn()
          }
        },
        {
          provide: BoletoRepository,
          useValue: {
            findBoletoById: jest.fn(),
            createBoleto: jest.fn(),
            updateBoletoStatus: jest.fn()
          }
        }
      ]
    }).compile();

    consumer = module.get<BoletoConsumer>(BoletoConsumer);
    boletoService = module.get<BoletoService>(BoletoService);
    boletoRepository = module.get<BoletoRepository>(BoletoRepository);
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
    expect(boletoService).toBeDefined();
    expect(boletoRepository).toBeDefined();
  });

  describe('generateBoleto', () => {
    it('should generate and send a boleto if not already exists', async () => {
      const job: Job = {
        id: 1,
        data: {
          debtId: '1',
          email: 'john@example.com',
          name: 'John Doe',
          governmentId: '12345678901'
        }
      } as Job;

      jest.spyOn(boletoRepository, 'findBoletoById').mockResolvedValue(null);
      jest
        .spyOn(boletoService, 'generateBoleto')
        .mockImplementation(async () => ({
          id: '1',
          linhaDigitavel: '12345678901234567890',
          valor: 100,
          vencimento: new Date(),
          status: BoletoStatus.GENERATED,
          payer: job.data,
          debtId: job.data.debtId
        }));
      jest
        .spyOn(boletoRepository, 'createBoleto')
        .mockImplementation(async () => ({
          id: '1',
          linhaDigitavel: '12345678901234567890',
          valor: 100,
          vencimento: new Date(),
          status: BoletoStatus.GENERATED,
          pagadorId: '1'
        }));
      jest
        .spyOn(boletoService, 'sendMail')
        .mockImplementation(async () => ({}) as any);
      jest
        .spyOn(boletoRepository, 'updateBoletoStatus')
        .mockImplementation(async () => ({}) as any);

      await consumer.generateBoleto(job);

      expect(boletoRepository.findBoletoById).toHaveBeenCalledWith(
        job.data.debtId
      );
      expect(boletoService.generateBoleto).toHaveBeenCalledWith(job.data);
      expect(boletoRepository.createBoleto).toHaveBeenCalled();
      expect(boletoService.sendMail).toHaveBeenCalled();
      expect(boletoRepository.updateBoletoStatus).toHaveBeenCalledWith(
        '1',
        BoletoStatus.SENT
      );
    });

    it('should not generate a boleto if it already exists in GENERATED status', async () => {
      const job: Job = {
        id: 1,
        data: {
          debtId: '1',
          email: 'john@example.com',
          name: 'John Doe',
          governmentId: '12345678901'
        }
      } as Job;

      jest.spyOn(boletoRepository, 'findBoletoById').mockResolvedValue({
        id: '1',
        linhaDigitavel: '12345678901234567890',
        valor: 100,
        vencimento: new Date(),
        status: BoletoStatus.GENERATED,
        pagadorId: '1'
      });
      jest
        .spyOn(boletoService, 'generateBoleto')
        .mockImplementation(async () => ({}) as any);
      jest
        .spyOn(boletoRepository, 'createBoleto')
        .mockImplementation(async () => ({}) as any);
      jest
        .spyOn(boletoService, 'sendMail')
        .mockImplementation(async () => ({}) as any);
      jest
        .spyOn(boletoRepository, 'updateBoletoStatus')
        .mockImplementation(async () => ({}) as any);

      await consumer.generateBoleto(job);

      expect(boletoRepository.findBoletoById).toHaveBeenCalledWith(
        job.data.debtId
      );
      expect(boletoService.generateBoleto).not.toHaveBeenCalled();
      expect(boletoRepository.createBoleto).not.toHaveBeenCalled();
      expect(boletoService.sendMail).toHaveBeenCalled();
      expect(boletoRepository.updateBoletoStatus).toHaveBeenCalled();
    });

    it('should not generate a boleto if it already exists in SENT status', async () => {
      const job: Job = {
        id: 1,
        data: {
          debtId: '1',
          email: 'john@example.com',
          name: 'John Doe',
          governmentId: '12345678901'
        }
      } as Job;

      jest.spyOn(boletoRepository, 'findBoletoById').mockResolvedValue({
        id: '1',
        linhaDigitavel: '12345678901234567890',
        valor: 100,
        vencimento: new Date(),
        status: BoletoStatus.SENT,
        pagadorId: '1'
      });
      jest
        .spyOn(boletoService, 'generateBoleto')
        .mockImplementation(async () => ({}) as any);
      jest
        .spyOn(boletoRepository, 'createBoleto')
        .mockImplementation(async () => ({}) as any);
      jest
        .spyOn(boletoService, 'sendMail')
        .mockImplementation(async () => ({}) as any);
      jest
        .spyOn(boletoRepository, 'updateBoletoStatus')
        .mockImplementation(async () => ({}) as any);

      await consumer.generateBoleto(job);

      expect(boletoRepository.findBoletoById).toHaveBeenCalledWith(
        job.data.debtId
      );
      expect(boletoService.generateBoleto).not.toHaveBeenCalled();
      expect(boletoRepository.createBoleto).not.toHaveBeenCalled();
      expect(boletoService.sendMail).not.toHaveBeenCalled();
      expect(boletoRepository.updateBoletoStatus).not.toHaveBeenCalled();
    });
  });
});
