import { Module } from '@nestjs/common';
import { FollowUpGatewayController } from './follow-up-gateway.controller';
import { FollowUpGatewayService } from './follow-up-gateway.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { UploadsModule } from './uploads/uploads.module';
import { NewGuestModule } from './new-guest/new-guest.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({
          isGlobal: true,
          expandVariables: true,
        }),
    UploadsModule,
    NewGuestModule
  ],
  controllers: [FollowUpGatewayController],
  providers: [FollowUpGatewayService],
})
export class FollowUpGatewayModule {}
