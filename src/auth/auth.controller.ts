import {
  Controller,
  UseFilters,
  Body,
  Post,
  UseGuards,
  Get,
  Req,
  Query,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthExceptionFilter } from '@/common/exception/auth-exception.filter';
import { UserService } from '@/user/user.service';
import { LoginDto, LocalLoginDto, LocalSignUpDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import {
  AuthenticatedGuard,
  LocalAuthGuard,
  GoogleAuthGuard,
} from '@/auth/guard/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { OAuthPayload } from './types/auth.types';
import { ConfigService } from '@nestjs/config';
import { UserStatus } from '@prisma/client';
import { ErrorCode } from '@/common/error-code';
import { SessionService } from '@/ses/sesssion.service';

@UseFilters(AuthExceptionFilter)
@Controller()
export class AuthController {
  constructor(
    private readonly userServcie: UserService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
  ) {}

  @Post('signUp')
  async localSignUp(@Body() dto: LocalSignUpDto) {
    const user = await this.authService.signUpLocal(dto);
    console.log(user.id, user.email);
    // 🔥 가입 후 인증메일 발송
    await this.authService.sendVerificationEmail(user.id, user.email!);

    return null;
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    await this.authService.verifyEmail(token);
    return null;
  }

  @Post('resend-verification-email')
  async resendVerificationEmail(@Body() dto: LocalSignUpDto) {
    const user = await this.authService.signUpLocal(dto);
    console.log(user.id, user.email);
    // 🔥 가입 후 인증메일 발송
    await this.authService.sendVerificationEmail(user.id, user.email!);

    return null;
  }

  @UseGuards(LocalAuthGuard)
  @Post('localLogin')
  async localLogin(@Req() req: Request, @Body() dto: LocalLoginDto) {
    const user = await this.authService.loginLocal(dto);
    if (user.status === UserStatus.PENDING)
      return { message: ErrorCode.EMAIL_VERIFICATION_REQUIRED };

    await this.sessionService.mapUserSession(user.id, req.sessionID);
    return { user: user };
  }

  @UseGuards(AuthenticatedGuard)
  @Get('test-guard')
  testGuardSession(@CurrentUser() user: Express.User) {
    const data = `http://${this.configService.get<string>('SERVER_HOST')}:${this.configService.get<string>('SERVER_PORT')}/auth/google`;
    console.log(data);
    console.log(user);

    return null;
  }

  @UseGuards(AuthenticatedGuard)
  @Post('logout')
  async logout(@Req() req: Request) {
    const user = req.user as { id: number };

    // userID와 SessionID 매핑 삭제
    await this.sessionService.delUserSession(user.id);

    //메모리 상태 정리, 세션 스토어 정리, 쿠키 무효화 유도
    await new Promise<void>((resolve, reject) => {
      req.logout((err) => {
        if (err)
          return reject(err instanceof Error ? err : new Error(String(err)));
        resolve();
      });
    });

    await new Promise<void>((resolve, reject) => {
      req.session.destroy((err) => {
        if (err)
          return reject(err instanceof Error ? err : new Error(String(err)));
        resolve();
      });
    });
    return null;
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.userServcie.findByUserId(dto.id);
    console.log(user);
    return { user: user };
  }

  @Get('to-google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleOAuthCallback(
    @Req() req: Request,
    @CurrentUser() user: OAuthPayload,
  ) {
    // 세션 저장
    await new Promise<void>((resolve, reject) => {
      req.login(user, (err?: unknown) => {
        if (err instanceof Error) {
          return reject(err);
        }
        if (err) {
          return reject(new Error('Login failed'));
        }
        resolve();
      });
    });
    return user;
  }

  @Get('google-test')
  @UseGuards(AuthenticatedGuard)
  googleLoginTest(@CurrentUser() user: OAuthPayload) {
    return user;
  }
}
