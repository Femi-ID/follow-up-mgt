import { NestFactory } from '@nestjs/core';
import { FollowUpGatewayModule } from './follow-up-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(FollowUpGatewayModule);
  await app.listen(process.env.port ?? 3001);
}
bootstrap();
