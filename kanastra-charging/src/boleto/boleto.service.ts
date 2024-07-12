import { Injectable, Logger } from '@nestjs/common';
import { Boleto } from './types/boleto.types';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { EmailService } from '@/email/email.service';
import { BillingFile } from '@/util/types/billing.type';

@Injectable()
export class BoletoService {
  constructor(
    private readonly mailerService: EmailService,
    @InjectQueue('boleto') private readonly boletoQueue: Queue
  ) {}

  async processBilingToBoleto(details: BillingFile) {
    await this.boletoQueue.add('generateBoleto', details, {
      attempts: 5,
      backoff: 3000,
      removeOnComplete: 1000,
      removeOnFail: 1000
    });
  }

  /**
   * Gera um boleto fictício com base nos detalhes de um arquivo de cobrança.
   * Grava um log com o ID da dívida.
   * @param details Os detalhes vindo do CSV
   * @returns O boleto gerado
   */
  async generateBoleto(details: BillingFile): Promise<Boleto> {
    Logger.verbose(`Generating boleto for ${details.debtId}`);

    return Promise.resolve({
      linhaDigitavel: `104956789012345678901234567${details.debtAmount.padStart(10, '0')}`,
      valor: parseInt(details.debtAmount) / 100,
      vencimento: new Date(details.debtDueDate),
      debtId: details.debtId,
      payer: {
        name: details.name,
        email: details.email,
        governmentId: details.governmentId
      }
    });
  }

  async sendMail(boleto: Boleto) {
    await this.mailerService.sendEmail({
      to: boleto.payer.email,
      subject: 'Seu boleto foi gerado!',
      body: `Olá, ${boleto.payer.name}! Seu boleto foi gerado com sucesso. O valor é de R$ ${boleto.valor.toFixed(
        2
      )}. Pague até ${boleto.vencimento.toDateString()}!
      Código de barras: ${boleto.linhaDigitavel}
      `
    });
  }
}
