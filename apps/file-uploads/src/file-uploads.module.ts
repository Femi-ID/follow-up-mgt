import { Module } from '@nestjs/common';
import { FileUploadsController } from './file-uploads.controller';
import { FileUploadsService } from './file-uploads.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NewGuest, NewGuestSchema } from './schemas/new-guests.schema';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { RedisSharedModule } from '@app/contracts/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MongooseModule.forFeature([
      { name: NewGuest.name, schema: NewGuestSchema },
    ]),
    
    // CacheModule.register({
    //   store: redisStore,
    //   username: process.env.REDIS_USERNAME,
    //   password: process.env.REDIS_PASSWORD,
    //   url: process.env.REDIS_URL,
    //   socket: {
    //     host: process.env.REDIS_HOST,
    //     port: process.env.REDIS_PORT,
    //   },
    //   ttl: 60 * 60, // 1hour
    //   isGlobal: true,
    // })
    RedisSharedModule,
  ],
  controllers: [FileUploadsController],
  providers: [FileUploadsService],
})
export class FileUploadsModule {}
