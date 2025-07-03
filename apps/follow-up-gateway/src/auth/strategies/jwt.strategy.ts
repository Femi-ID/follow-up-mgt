import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { JwtPayload } from '../dto/auth-jwtPayload.dto';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY) 
    private jwtConfiguration: ConfigType<typeof jwtConfig>,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfiguration.secret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    const userId = payload.sub
    console.log('jwt-userID typeof', typeof userId)
    console.log('payload..', payload)
    return await this.authService.validateJwtUser(payload); // to return the userId and user.role 
  }
//   validate func takes the decoded payload from the base class.The returned obj is appended to the user object.
//  The extraction, decoding and validating the jwt is done by the base class- PassportStrategy(Strategy)
}
