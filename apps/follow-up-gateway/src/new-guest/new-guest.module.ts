import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../guards/roles/roles.guard';
import { NewGuestService } from './new-guest.service';
import { NewGuestController } from './new-guest.controller';

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
  ],
  providers: [
      { provide: APP_GUARD, useClass: JwtAuthGuard },
      { provide: APP_GUARD, useClass: RolesGuard },
      NewGuestService,
    ],
  controllers: [NewGuestController],
})
export class NewGuestModule {}
