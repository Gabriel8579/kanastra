import { Module } from '@nestjs/common';
import type { RedisClientOptions } from 'redis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BillingModule } from './modules/billing/billing.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';

@Module({
  imports: [
    BillingModule,
    CacheModule.registerAsync<RedisClientOptions>({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        url: `redis://${configService.get('redis.host')}:${configService.get('redis.port')}/${configService.get('redis.db')}`,
        ttl: 60 * 60 * 24 * 1000
      }),
      isGlobal: true
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port')
        }
      })
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration]
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
