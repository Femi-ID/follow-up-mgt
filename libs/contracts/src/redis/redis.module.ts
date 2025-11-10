import { Module, Global } from '@nestjs/common';
import { CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ConfigModule,
    CacheModule.registerAsync<CacheModuleOptions>({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUrl =
          configService.get<string>('REDIS_URL') ||
          `redis://${configService.get<string>('REDIS_USERNAME')}:${configService.get<string>('REDIS_PASSWORD')}@${configService.get<string>('REDIS_HOST')}:${configService.get<number>('REDIS_PORT')}`;

        console.log('Connecting to Redis at:', redisUrl); // <- Add this
        return {
          store: redisStore,
          url: redisUrl,
          ttl: 60 * 60, // 1 hour
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class RedisSharedModule {}
