import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JwtPayload } from '@app/contracts/auth/dto/auth-jwtPayload.dto';
import { CreateUserDto } from '@app/contracts/auth/dto/create-user.dto';
import { CreateGoogleUserDto } from '@app/contracts/auth/dto/create-googleUser.dto';
import { AuthPatterns } from '@app/contracts/auth/constants/message-patterns';
// import { LoginUserDto } from '@app/contracts/auth/dto/login-user.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AuthPatterns.VALIDATE_USER)
  async validateUser(@Payload() {email, password}: {email: string, password: string}) {
    return this.authService.validateUser(email, password);
  }

  @MessagePattern(AuthPatterns.LOGIN)
  async login(@Payload() {userId, userRole}: {userId: string, userRole: string}) {
    return this.authService.login(userId, userRole);
  }

  @MessagePattern(AuthPatterns.REFRESH_TOKEN)
  async refreshToken(@Payload() payload: JwtPayload) {
    return this.authService.refreshToken(payload)
  }

  @MessagePattern(AuthPatterns.VALIDATE_REFRESH_TOKEN)
  async validateRefreshToken(@Payload() {userId, refreshToken}) {
    return this.authService.validateRefreshToken(userId, refreshToken);
  }

  @MessagePattern(AuthPatterns.SIGN_OUT)
  async signOut(@Payload() userId: string) {
    return this.authService.signOut(userId)
  }

  @MessagePattern(AuthPatterns.VALIDATE_JWT_USER)
  async validateJwtUser(@Payload() payload: JwtPayload) {
    return this.authService.validateJwtUser(payload)
  }

  @MessagePattern(AuthPatterns.VALIDATE_GOOGLE_USER)
  async validateGoogleUser(@Payload() googleUser: CreateGoogleUserDto) {
    return this.authService.validateGoogleUser(googleUser)
  }
}
