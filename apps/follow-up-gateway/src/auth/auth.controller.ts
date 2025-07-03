import { Body, Controller, Get, Post, Req, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { LocalAuthGuard } from 'apps/auth/src/guards/local-auth/local-auth.guard';
import { RefreshAuthGuard } from '../guards/refresh-auth/refresh-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() credential: LoginUserDto, @Request() req) {
    console.log('User authenticated successfully:', req.user);
    return await this.authService.login(req.user.id, req.user.role);
  }

  @UseGuards(RefreshAuthGuard)
  @Get('refresh')
  async refresh(@Req() req) {
    return this.authService.refreshToken({'sub': req.user.id, 'role': req.user.role});
  }

  @UseGuards(JwtAuthGuard)
  @Post('sign-out')
  async signOut(@Req() req) {
    return this.authService.signOut(req.user.id);
  }
}
