import { JwtPayload } from '@app/contracts/auth/dto/auth-jwtPayload.dto';
import { CurrentRequestUserDto } from '@app/contracts/auth/dto/current-request-user.dto';
// import { LoginUserDto } from '@app/contracts/auth/dto/login-user.dto';
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import jwtRefreshConfig from 'apps/follow-up-gateway/src/auth/config/jwt-refresh.config';
import { UsersService } from 'apps/users/src/users.service';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(jwtRefreshConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof jwtRefreshConfig>,
  ) {}

  async validateUser(email: string, password: string) {
    // validates user's credentials against the database
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('Incorrect user credentials');

    const isPasswordValid = await this.verifyPassword(user.password, password);
    if (!isPasswordValid)
      throw new BadRequestException('Incorrect user credentials');

    console.log('User validated successfully:', user);
    return { id: user.id, email: user.email, role: user.role };
  }

  async verifyPassword(hash: string, plainPassword: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plainPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      throw new Error('Could not verify password.');
    }
  }

  async login(userId: string, userRole: string) {
    const payload = { sub: userId, role: userRole };
    // const accessToken = await this.jwtService.signAsync(payload);
    // const refreshToken = await this.jwtService.signAsync(payload, this.refreshTokenConfig)
    const { accessToken, refreshToken } = await this.generateToken(payload);
    const hashedRefreshedToken = await argon2.hash(refreshToken);
    await this.usersService.updateHashedRefreshToken(
      userId,
      hashedRefreshedToken,
    );
    return {
      userId: userId,
      accessToken: accessToken,
      refreshToken,
      message: 'Login successful -(from auth service)',
    };
  }

  async refreshToken(payload: JwtPayload) {
    const { accessToken, refreshToken } = await this.generateToken(payload);
    // doing this means the user will never re-login cause the refresh-token won't get expired, BAD??
    const hashedRefreshedToken = await argon2.hash(refreshToken);
    await this.usersService.updateHashedRefreshToken(
      payload.sub,
      hashedRefreshedToken,
    ); // update the user db
    return {
      id: payload.sub,
      accessToken,
      refreshToken,
      message: 'New user accessToken and refresh token sent',
    };
  }

  async generateToken(payload: JwtPayload) {
    // const payload = { sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);
    return { accessToken, refreshToken };
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    try {
      const user = await this.usersService.findOne(userId);
      if (!user || !user.hashedRefreshToken)
        throw new UnauthorizedException(
          'Invalid user credential or refreshToken',
        );
      const sameRefreshToken = await argon2.verify(
        user.hashedRefreshToken,
        refreshToken,
      );
      if (!sameRefreshToken)
        throw new UnauthorizedException('Invalid refreshToken');
      return { id: userId };
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException({ message: 'Unable to validate refreshToken', 'error': error });
    }
  }

  async signOut(userId: string) {
    await this.usersService.updateHashedRefreshToken(userId, null);
    return { message: 'User signed out and refreshToken discarded.' };
  }

  async validateJwtUser(payload: JwtPayload) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) throw new BadRequestException('Invalid user ID');
    if (user.role !== payload.role ) throw new UnauthorizedException('User role does not match the JWT payload role.')
    const currentUser: CurrentRequestUserDto = { id: user.id, role: user.role };
    return currentUser;

  }
}
