import { NestFactory } from '@nestjs/core';
import { NewGuestModule } from './new-guest.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('NewGuestMain')
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NewGuestModule,
    {
      transport: Transport.TCP,
      options: { port: 3005 },
    },
  );
  await app.listen();
  logger.log('NewGuest microservice is running on port 3005');
}
bootstrap();
