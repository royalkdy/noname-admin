import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { OAuthProvider } from '@/auth/types/auth.types';
import { AuthService } from '@/auth/auth.service';
import { OAuthPayload } from '@/auth/types/auth.types';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly config: ConfigService,
    private readonly auth: AuthService,
  ) {
    super({
      clientID: config.get<string>('GOOGLE_OAUTH_CLIENT_ID')!,
      clientSecret: config.get<string>('GOOGLE_OAUTH_SECRET')!,
      callbackURL: `http://${config.get<string>('SERVER_HOST')}:${config.get<string>('SERVER_PORT')}/auth/google`,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const oauthPayload: OAuthPayload = {
      provider: OAuthProvider.GOOGLE,
      providerUserId: profile.id,
      nickname: `user_${profile.id.slice(0, 6)}`,
      email: profile.emails?.[0]?.value ?? undefined,
    };

    const user = await this.auth.loginOAuth(oauthPayload);

    return user;
  }
}
