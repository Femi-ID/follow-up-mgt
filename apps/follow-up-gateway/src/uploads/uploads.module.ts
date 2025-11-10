import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
// import { redisInsStore } from 'cache-manager-redis-yet';
import redisStore from 'cache-manager-redis-store';
import { RedisSharedModule } from '@app/contracts/redis/redis.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../guards/roles/roles.guard';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'UPLOAD_CLIENT',
        transport: Transport.TCP,
        options: { port: 3004 },
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),

    RedisSharedModule,

    // CacheModule.register({
    //   store: redisStore,
    //   // username: process.env.REDIS_USERNAME,
    //   password: process.env.REDIS_PASSWORD,
    //   url: process.env.REDIS_URL,
    //   host: process.env.REDIS_HOST,
    //   port: parseInt(process.env.REDIS_PORT, 10),
    //   socket: {
    //   host: process.env.REDIS_HOST,
    //   port: parseInt(process.env.REDIS_PORT, 10),
    //   },
    //   ttl: 60 * 60, // 1hour
    //   isGlobal: true,
    // }),

    // CacheModule.registerAsync({
    //   useFactory: async (configService: ConfigService) => ({
    //     store: await redisInsStore({
    //       password: configService.get<string>('REDIS_PASSWORD'),
    //       url: configService.get<string>('REDIS_URL'),
    //       // ttl: 60 * 1000, // 1hour
    //     }),
    //   }),
    //   inject:[ConfigService],
    //   isGlobal: true
    // })
  ],
  providers: [
    UploadsService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  controllers: [UploadsController],
})
export class UploadsModule {}
