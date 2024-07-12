import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { BoletoService } from 'src/boleto/boleto.service';
import { BoletoStatus } from 'src/boleto/types/boleto.types';
import { BillingFile } from 'src/util/types/billing.type';
import { BoletoRepository } from '../../boleto/repository/boleto.repository';
import { Job } from 'bull';

@Processor('boleto')
export class BoletoConsumer {
  constructor(
    private readonly boletoService: BoletoService,
    private readonly boletoRepository: BoletoRepository
  ) {}

  @Process('generateBoleto')
  async generateBoleto(job: Job<BillingFile>) {
    Logger.verbose(
      `Processing job ${job.id} to generate boleto for ${job.data.debtId}`
    );
    let foundBoleto = await this.boletoRepository.findBoletoById(
      job.data.debtId
    );
    if (foundBoleto) {
      Logger.warn(`Boleto for debt ${job.data.debtId} already exists`);
    }

    if (!foundBoleto) {
      Logger.verbose(`Generating boleto for ${job.data.debtId}`);
      const boleto = await this.boletoService.generateBoleto(job.data);
      Logger.verbose(
        `Boleto generated for ${job.data.debtId} with value ${boleto.valor} and due date ${boleto.vencimento}`
      );
      Logger.verbose(`Creating boleto for ${job.data.debtId} in the database`);
      foundBoleto = await this.boletoRepository.createBoleto(boleto);
      Logger.verbose(`Boleto for ${job.data.debtId} created in the database`);
    }

    if (foundBoleto.status === BoletoStatus.GENERATED) {
      await this.boletoService.sendMail({
        debtId: foundBoleto.id,
        linhaDigitavel: foundBoleto.linhaDigitavel,
        payer: {
          email: job.data.email,
          name: job.data.name,
          governmentId: job.data.governmentId
        },
        valor: foundBoleto.valor,
        vencimento: foundBoleto.vencimento
      });
      await this.boletoRepository.updateBoletoStatus(
        foundBoleto.id,
        BoletoStatus.SENT
      );
    }
  }
}
