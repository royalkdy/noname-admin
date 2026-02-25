import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CommonModule } from '@/common/common.module';
import { UserModule } from '@/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/local.strategy';
import { SessionSerializer } from './session.serializer';
import { GoogleStrategy } from './strategy/google.strategy';
import { SessionModule } from '@/ses/session.module';

@Module({
  imports: [
    CommonModule,
    UserModule,
    SessionModule,
    PassportModule.register({ session: true }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, GoogleStrategy, SessionSerializer],
})
export class AuthModule {}
