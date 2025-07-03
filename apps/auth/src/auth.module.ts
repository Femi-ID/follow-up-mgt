import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'apps/users/src/schemas/users.schemas';
import { UsersService } from 'apps/users/src/users.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from 'apps/follow-up-gateway/src/auth/config/jwt.config';
import jwtRefreshConfig from 'apps/follow-up-gateway/src/auth/config/jwt-refresh.config';
import { RefreshJwtStrategy } from 'apps/follow-up-gateway/src/auth/strategies/refresh.strategy';
import { JwtStrategy } from 'apps/follow-up-gateway/src/auth/strategies/jwt.strategy';
// import * as { AuthMicroService } from 'apps/follow-up-gateway/src/auth/auth.service'; 

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(jwtRefreshConfig),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, LocalStrategy, JwtStrategy, RefreshJwtStrategy],
})
export class AuthModule {}
