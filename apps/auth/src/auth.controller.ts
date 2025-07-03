import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JwtPayload } from '@app/contracts/auth/dto/auth-jwtPayload.dto';
// import { LoginUserDto } from '@app/contracts/auth/dto/login-user.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.validateUser')
  async validateUser(@Payload() {email, password}: {email: string, password: string}) {
    return this.authService.validateUser(email, password);
  }

  @MessagePattern('auth.login')
  async login(@Payload() userId: string) {
    return this.authService.login(userId);
  }

  @MessagePattern('auth.refreshToken')
  async refreshToken(@Payload() userId: string) {
    return this.authService.refreshToken(userId)
  }

  @MessagePattern('auth.validateRefreshToken')
  async validateRefreshToken(@Payload() {userId, refreshToken}) {
    return this.authService.validateRefreshToken(userId, refreshToken);
  }

  @MessagePattern('auth.signOut')
  async signOut(@Payload() userId: string) {
    return this.authService.signOut(userId)
  }
}
