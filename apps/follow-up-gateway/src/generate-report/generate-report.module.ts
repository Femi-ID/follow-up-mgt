import { Module } from '@nestjs/common';
import { GenerateReportService } from './generate-report.service';
import { GenerateReportController } from './generate-report.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../guards/roles/roles.guard';

@Module({
  imports: [
      ClientsModule.register([
        {
          name: 'GENERATE_REPORT_CLIENT',
          transport: Transport.TCP,
          options: { port: 3006 },
        },
        {
          name: 'NEW_GUEST_CLIENT',
          transport: Transport.TCP,
          options: { port: 3005 },
        },
      ]),
  
      ConfigModule.forRoot({
        isGlobal: true,
        expandVariables: true,
      }),
    ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    GenerateReportService
  ],
  controllers: [GenerateReportController]
})
export class GenerateReportModule {}
