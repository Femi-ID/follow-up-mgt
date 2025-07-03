import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      transport: Transport.TCP,
      options: { port: 3002 },
    },
  );
  await app.listen();
  Logger.log('Auth microservice is running on port 3002');
  // Logger.log(process.env.NAME)
}
bootstrap();
