import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { LoginUserDto } from './dto/login-user.dto';
import { Role } from 'apps/users/src/enums/roles.enums';
import { JwtPayload } from './dto/auth-jwtPayload.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateGoogleUserDto } from '../users/dto/create-googleUser.dto';
import { AuthPatterns } from '@app/contracts/auth/constants/message-patterns';


@Injectable()
export class AuthService {
  constructor(@Inject('AUTH_CLIENT') private authClient: ClientProxy) {}

  async validateUser(email: string, password: string): Promise<any> {
    return await firstValueFrom(this.authClient.send(AuthPatterns.VALIDATE_USER, { email, password }));
  }

  async login(userId: string, userRole: string) {
    return await firstValueFrom(this.authClient.send(AuthPatterns.LOGIN, {userId, userRole}));
  }

  async refreshToken(payload: JwtPayload) {
    return await firstValueFrom(this.authClient.send(AuthPatterns.REFRESH_TOKEN, payload));
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    return await firstValueFrom(this.authClient.send(AuthPatterns.VALIDATE_REFRESH_TOKEN, {userId, refreshToken}));
  }

  async signOut(userId: string) {
    return await firstValueFrom(this.authClient.send(AuthPatterns.SIGN_OUT, userId));
  }

  async validateJwtUser(payload: JwtPayload) {
    return await firstValueFrom(this.authClient.send(AuthPatterns.VALIDATE_JWT_USER, payload));
  }

  async googleLogin() {
    return await firstValueFrom(this.authClient.send(AuthPatterns.GOOGLE_LOGIN, {}));
  }

  async validateGoogleUser(googleUser: CreateGoogleUserDto) {
    return await firstValueFrom(this.authClient.send(AuthPatterns.VALIDATE_GOOGLE_USER, googleUser));
  }
}
