import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { EmailService } from './email.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mail'
    })
  ],
  providers: [EmailService],
  exports: [EmailService]
})
export class EmailModule {}
