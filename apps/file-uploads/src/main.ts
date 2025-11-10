import { NestFactory } from '@nestjs/core';
import { FileUploadsModule } from './file-uploads.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    FileUploadsModule,
    {
      transport: Transport.TCP,
      options: { port: 3004 },
    },
  );
  await app.listen();
  Logger.log('File uploads microservice is running on port 3004');
}
bootstrap();
