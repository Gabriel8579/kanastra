import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log']
  });

  Logger.log(`Application is running`, 'Bootstrap');
}
bootstrap();
