import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { LoginUserDto } from '../dto/login-user.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

   async validate(email: string, password: string) {
    if (password == '')
      throw new BadRequestException('Password field cannot be empty');
    const user = await this.authService.validateUser(email, password);
    // console.log('user..', user)
    return user;
  }
  // This class would typically extend Passport's LocalStrategy
  // and implement the necessary methods for user validation.
}
