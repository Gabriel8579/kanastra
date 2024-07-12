import { Module } from '@nestjs/common';
import { EmailModule } from 'src/email/email.module';
import { BoletoService } from './boleto.service';
import { BullModule } from '@nestjs/bull';
import { BoletoRepository } from './repository/boleto.repository';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    EmailModule,
    BullModule.registerQueue({
      name: 'boleto'
    }),
    DatabaseModule
  ],
  providers: [BoletoService, BoletoRepository],
  exports: [BoletoService, BoletoRepository]
})
export class BoletoModule {}
