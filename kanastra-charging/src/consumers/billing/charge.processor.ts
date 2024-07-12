import { OnQueueCompleted, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { BoletoService } from 'src/boleto/boleto.service';
import { BillingJob } from 'src/util/types/billing.type';

@Processor('billing')
export class ChargeConsumer {
  constructor(private readonly boletoService: BoletoService) {}

  @Process('emitCharge')
  async emitCharge(job: Job<BillingJob>) {
    const length = job.data.bills?.length || 0;
    const percent = length / 100;
    for (let i = 0; i < length; i++) {
      await this.boletoService.processBilingToBoleto(job.data.bills[i]);
      job.progress(i / percent);
    }
  }

  @OnQueueCompleted()
  async onCompleted(job: Job) {
    Logger.log(`Job ${job.id} completed`);
  }
}
