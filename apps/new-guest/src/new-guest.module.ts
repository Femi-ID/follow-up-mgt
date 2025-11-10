import { Module } from '@nestjs/common';
import { NewGuestController } from './new-guest.controller';
import { NewGuestService } from './new-guest.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NewGuest, NewGuestSchema } from 'apps/file-uploads/src/schemas/new-guests.schema';
import { NewGuestAnalyticsController } from './new-guest-analytics.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
          isGlobal: true,
          expandVariables: true,
        }),
        // ConfigModule.forFeature()
        MongooseModule.forRoot(process.env.MONGODB_URI),
        MongooseModule.forFeature([{ name: NewGuest.name, schema: NewGuestSchema }]),
  ],
  controllers: [NewGuestController, NewGuestAnalyticsController],
  providers: [NewGuestService],
})
export class NewGuestModule {}
