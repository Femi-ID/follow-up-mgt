import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigType } from '@nestjs/config';
import jwtRefreshConfig from '../config/jwt-refresh.config';
import { JwtPayload } from '../dto/auth-jwtPayload.dto';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refreshJwt', // the custom name we set for this strategy
) {
  constructor(
    @Inject(jwtRefreshConfig.KEY)
    private refreshJwtConfiguration: ConfigType<typeof jwtRefreshConfig>,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: refreshJwtConfiguration.secret, // to verify then refresh-jwt
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.get('authorization').replace('Bearer', '').trim();
    const userId = payload.sub
    return await this.authService.validateRefreshToken(userId, refreshToken)
    // return { id: payload.sub };
  }
}
// if the refreshToken exists and is valid and not expired, 
// it will be decoded and sent to the validate function
