import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { LoginUserDto } from './dto/login-user.dto';


@Injectable()
export class AuthService {
  constructor(@Inject('AUTH_CLIENT') private authClient: ClientProxy) {}

  async validateUser(email: string, password: string): Promise<any> {
    return await firstValueFrom(this.authClient.send('auth.validateUser', { email, password }));
  }

  async login(userId: string) {
    return await firstValueFrom(this.authClient.send('auth.login', userId));
  }

  async refreshToken(userId: string) {
    return await firstValueFrom(this.authClient.send('auth.refreshToken', userId));
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    return await firstValueFrom(this.authClient.send('auth.validateRefreshToken', {userId, refreshToken}));
  }

  async signOut(userId: string) {
    return await firstValueFrom(this.authClient.send('auth.signOut', userId));
  }
}
