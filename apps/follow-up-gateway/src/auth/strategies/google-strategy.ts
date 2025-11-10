import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import googleOauthConfig from '../config/google-oauth.config';
import { ConfigType } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Role } from 'apps/users/src/enums/roles.enums';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(googleOauthConfig.KEY)
    private googleConfiguration: ConfigType<typeof googleOauthConfig>,
    private authService: AuthService
  ) {
    super({
      clientID: googleConfiguration.clientID,
      clientSecret: googleConfiguration.clientSecret,
      callbackURL: googleConfiguration.callbackURL,
      scope: ['email', 'profile'] // the data we need to get back from the google API
    });
  }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    const user = await this.authService.validateGoogleUser({
      firstName: profile.name.givenName,
      lastName: profile.name.givenName,
      email: profile.emails[0].value,
      password: '',
      avatarUrl: profile.photos[0].value,
      role: Role.TEAM_MEMBER, //option change to regular user: Role.REGULAR_USER
      isSocialAuth: true
    })
    // return user;
    done(null, user) // first arg: error object, second arg: user arg that will be passed to the request object.
    console.log('profile..', profile)
    console.log('user::', user)


    // to check if the user is registered in the db, if not we create a record in the db
  }
}
