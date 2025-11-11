import { Module } from '@nestjs/common';
import { GenerateReportController } from './generate-report.controller';
import { GenerateReportService } from './generate-report.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NewGuest, NewGuestSchema } from 'apps/file-uploads/src/schemas/new-guests.schema';
import { NewGuestService } from 'apps/new-guest/src/new-guest.service';

@Module({
  imports: [
    ClientsModule.register([
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
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MongooseModule.forFeature([{ name: NewGuest.name, schema: NewGuestSchema }]),
  ],
  controllers: [GenerateReportController],
  providers: [GenerateReportService, NewGuestService],
})
export class GenerateReportModule {}
