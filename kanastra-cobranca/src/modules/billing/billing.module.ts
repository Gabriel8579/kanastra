import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { BullModule } from '@nestjs/bull';
import { ChargeProcessor } from './consumer/charge.processor';

@Module({
  imports: [BullModule.registerQueue({ name: 'billing' })],
  controllers: [BillingController],
  providers: [BillingService]
})
export class BillingModule {}
