import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { BoletoModule } from './boleto/boleto.module';
import { BoletoConsumer } from './consumers/billing/boleto.processor';
import { ChargeConsumer } from './consumers/billing/charge.processor';
import { MailConsumer } from './consumers/billing/mailing.processor';
import { DatabaseModule } from './database/database.module';
import { EmailModule } from './email/email.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          redis: {
            host: configService.get<string>('redis.host'),
            port: configService.get<number>('redis.port')
          }
        };
      }
    }),
    BullModule.registerQueue({
      name: 'billing'
    }),
    BullModule.registerQueue({
      name: 'boleto'
    }),
    EmailModule,
    BoletoModule,
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      cache: true
    })
  ],
  providers: [ChargeConsumer, MailConsumer, BoletoConsumer]
})
export class AppModule {}
