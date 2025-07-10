import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([{
      name: 'UPLOAD_CLIENT',
      transport: Transport.TCP,
      options: { port: 3004 },
    }]),
  ],
  providers: [UploadsService],
  controllers: [UploadsController]
})
export class UploadsModule {}
