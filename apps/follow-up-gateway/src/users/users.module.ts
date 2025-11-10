import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '../auth/config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { RolesGuard } from '../guards/roles/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig.asProvider()), // register jwt configurations
    ConfigModule.forFeature(jwtConfig), // to access the jwt configurations for this module
    ClientsModule.register([
      {
        name: 'USER_CLIENT',
        transport: Transport.TCP,
        options: { port: 3003 },
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard }, 
    // we apply the JwtAuthGuard to the useGuards decorator on all endpoints
    // RolesGuard comes after the JwtAuthGuard cause of the request.user object
  ],
})
export class UsersModule {}
