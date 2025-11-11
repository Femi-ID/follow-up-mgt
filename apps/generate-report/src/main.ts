import { NestFactory } from '@nestjs/core';
import { GenerateReportModule } from './generate-report.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('GenerateReportMain');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    GenerateReportModule,
    {
      transport: Transport.TCP,
      options: { port: 3006 },
    },
  );
  await app.listen();
  logger.log('Generate-Report microservice is running on port 3006');
}
bootstrap();
