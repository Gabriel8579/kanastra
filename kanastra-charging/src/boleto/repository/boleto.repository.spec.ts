import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service';
import { BoletoRepository } from './boleto.repository';
import { Boleto, BoletoStatus } from '../types/boleto.types';

describe('BoletoRepository', () => {
  let boletoRepository: BoletoRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoletoRepository,
        {
          provide: PrismaService,
          useValue: {
            boleto: {
              create: jest.fn(),
              update: jest.fn(),
              findUnique: jest.fn()
            }
          }
        }
      ]
    }).compile();

    boletoRepository = module.get<BoletoRepository>(BoletoRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(boletoRepository).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('createBoleto', () => {
    it('should successfully create a boleto', async () => {
      const boletoDetails: Boleto = {
        debtId: '1',
        linhaDigitavel: '123456789',
        status: BoletoStatus.GENERATED,
        valor: 100,
        vencimento: new Date(),
        payer: {
          governmentId: '12345678901',
          email: 'payer@example.com',
          name: 'Payer Name'
        }
      };

      jest
        .spyOn(prismaService.boleto, 'create')
        .mockResolvedValue(boletoDetails as any);

      const result = await boletoRepository.createBoleto(boletoDetails);

      expect(result).toEqual(boletoDetails);
      expect(prismaService.boleto.create).toHaveBeenCalledWith({
        data: expect.any(Object)
      });
    });
  });

  describe('updateBoletoStatus', () => {
    it('should update the status of a boleto', async () => {
      const boletoId = '1';
      const newStatus = BoletoStatus.GENERATED;

      jest.spyOn(prismaService.boleto, 'update').mockResolvedValue({
        id: boletoId,
        status: newStatus
      } as any);

      const result = await boletoRepository.updateBoletoStatus(
        boletoId,
        newStatus
      );

      expect(result).toEqual({
        id: boletoId,
        status: newStatus
      });
      expect(prismaService.boleto.update).toHaveBeenCalledWith({
        where: { id: boletoId },
        data: { status: newStatus }
      });
    });
  });

  describe('findBoletoById', () => {
    it('should return a boleto by id', async () => {
      const boletoId = '1';
      const boletoDetails = {
        id: boletoId,
        linhaDigitavel: '123456789',
        status: BoletoStatus.GENERATED,
        valor: 100,
        vencimento: new Date()
      };

      jest
        .spyOn(prismaService.boleto, 'findUnique')
        .mockResolvedValue(boletoDetails as any);

      const result = await boletoRepository.findBoletoById(boletoId);

      expect(result).toEqual(boletoDetails);
      expect(prismaService.boleto.findUnique).toHaveBeenCalledWith({
        where: { id: boletoId }
      });
    });
  });
});
