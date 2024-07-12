import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Boleto, BoletoStatus } from '../types/boleto.types';

@Injectable()
export class BoletoRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createBoleto(details: Boleto) {
    try {
      const boletoCriado = await this.prismaService.boleto.create({
        data: {
          id: details.debtId,
          linhaDigitavel: details.linhaDigitavel,
          status: details.status || BoletoStatus.GENERATED,
          valor: details.valor,
          vencimento: details.vencimento,
          pagador: {
            connectOrCreate: {
              create: {
                governmentId: details.payer.governmentId,
                email: details.payer.email,
                name: details.payer.name
              },
              where: {
                governmentId: details.payer.governmentId
              }
            }
          }
        }
      });
      return boletoCriado;
    } catch (error) {
      Logger.error(error, BoletoRepository.name);
      throw error;
    }
  }

  async updateBoletoStatus(id: string, status: BoletoStatus) {
    return await this.prismaService.boleto.update({
      where: {
        id
      },
      data: {
        status
      }
    });
  }

  async findBoletoById(id: string) {
    return await this.prismaService.boleto.findUnique({
      where: {
        id
      }
    });
  }
}
