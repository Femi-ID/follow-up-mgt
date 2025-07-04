import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { LoginUserDto } from './dto/login-user.dto';
import { Role } from 'apps/users/src/enums/roles.enums';
import { JwtPayload } from './dto/auth-jwtPayload.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateGoogleUserDto } from '../users/dto/create-googleUser.dto';


@Injectable()
export class AuthService {
  constructor(@Inject('AUTH_CLIENT') private authClient: ClientProxy) {}

  async validateUser(email: string, password: string): Promise<any> {
    return await firstValueFrom(this.authClient.send('auth.validateUser', { email, password }));
  }

  async login(userId: string, userRole: string) {
    return await firstValueFrom(this.authClient.send('auth.login', {userId, userRole}));
  }

  async refreshToken(payload: JwtPayload) {
    return await firstValueFrom(this.authClient.send('auth.refreshToken', payload));
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    return await firstValueFrom(this.authClient.send('auth.validateRefreshToken', {userId, refreshToken}));
  }

  async signOut(userId: string) {
    return await firstValueFrom(this.authClient.send('auth.signOut', userId));
  }

  async validateJwtUser(payload: JwtPayload) {
    return await firstValueFrom(this.authClient.send('auth.validateJwtUser', payload));
  }

  async googleLogin() {
    return await firstValueFrom(this.authClient.send('auth.googleLogin', {}));
  }

  async validateGoogleUser(googleUser: CreateGoogleUserDto) {
    return await firstValueFrom(this.authClient.send('auth.validateGoogleUser', googleUser));
  }
}
