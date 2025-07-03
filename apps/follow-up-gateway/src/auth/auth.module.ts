import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import jwtRefreshConfig from './config/jwt-refresh.config';
import { RefreshJwtStrategy } from './strategies/refresh.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../guards/roles/roles.guard';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig.asProvider()), // register jwt configurations
    ConfigModule.forFeature(jwtConfig), // to access the jwt configurations for this module
    ConfigModule.forFeature(jwtRefreshConfig), // access the refresh-jwt config for this module
    ClientsModule.register([
      {
        name: 'AUTH_CLIENT',
        transport: Transport.TCP,
        options: {
          port: 3002,
          // host: '127.0.0.1',
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    RefreshJwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard }, // @UseGuards(JwtAuthGuard) applied on all API endpoints
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [AuthService],
})
export class AuthModule {}
