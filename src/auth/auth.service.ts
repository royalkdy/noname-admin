import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ErrorCode } from '@/common/error-code';
import { UserService } from '@/user/user.service';
import { SessionService } from '@/ses/sesssion.service';
import { LocalLoginDto, LocalSignUpDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { OAuthPayload } from '@/auth/types/auth.types';
import { generateEmailToken } from '@/common/utils/token.util';
import { PrismaService } from '@/common/prisma/prisma.service';
import { UserStatus } from '@/user/user.enums';
import { generateRandomNickname } from '@/common/utils/random-nickname.util';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async localValidateUser(email: string, password: string) {
    const user = await this.userService.findUserWithPasswordByEmail(email);

    if (!user) {
      throw new HttpException(ErrorCode.USER_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }

    const { password: hashedPassword, ...userInfo } = user;
    if (bcrypt.compareSync(password, hashedPassword ?? '')) {
      return userInfo;
    }

    return null;
  }

  async loginLocal(dto: LocalLoginDto) {
    const user = await this.userService.findByEmail(dto.email);

    if (!user) {
      throw new HttpException(ErrorCode.USER_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }

    return user;
  }

  async signUpLocal(dto: LocalSignUpDto) {
    const isExistUser = await this.userService.findByEmail(dto.email);
    if (isExistUser) {
      throw new HttpException(
        ErrorCode.USER_ALREADY_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }
    const nickname = generateRandomNickname();
    const encryptedPassword = bcrypt.hashSync(dto.password, 10);
    const resultUserinfo = await this.userService.createLocalUser(
      dto.email,
      encryptedPassword,
      nickname,
    );
    return resultUserinfo;
  }

  //구글 로그인 완료후 server로 로그인 요청
  async loginOAuth(data: OAuthPayload) {
    const existing = await this.userService.findByOAuth(
      data.provider,
      data.providerUserId,
    );

    if (existing) {
      return existing.user;
    }

    const user = this.userService.createOAuthUser(data);
    return user;
  }

  async sendVerificationEmail(userId: number, email: string) {
    const token = generateEmailToken();

    await this.prismaService.emailVerification.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 5),
      },
    });

    const host = this.configService.get<string>('SERVER_HOST');
    const port = this.configService.get<string>('SERVER_PORT');
    const link = `http://${host}:${port}/api/auth/verify-email?token=${token}`;

    await this.sessionService.sendEmail(
      email,
      '이메일 인증 - noname',
      `<a href="${link}">이메일 인증 - noname</a>`,
    );
  }

  async resendVerificationEmail(userId: number, email: string) {
    const record = await this.prismaService.emailVerification.findFirst({
      where: {
        userId,
      },
    });

    // 유저는 이미 이메일을 받았고 토큰이 아직 유효한 상태
    if (record && record.expiresAt > new Date() && !record.verified) {
      throw new BadRequestException('ALREADY_SENT_VERIFICATION_EMAIL');
    }

    // 토큰 재발급 & 이메일 전송
    const token = generateEmailToken();
    await this.prismaService.$transaction(async (tx) => {
      await tx.emailVerification.deleteMany({
        where: { userId },
      });

      await tx.emailVerification.create({
        data: {
          userId,
          token,
          expiresAt: new Date(Date.now() + 1000 * 60 * 5),
        },
      });
    });

    const host = this.configService.get<string>('SERVER_HOST');
    const port = this.configService.get<string>('SERVER_PORT');
    const link = `http://${host}:${port}/api/auth/verify-email?token=${token}`;

    await this.sessionService.sendEmail(
      email,
      '이메일 인증 - noname',
      `<a href="${link}">이메일 인증 - noname</a>`,
    );
  }

  async verifyEmail(token: string) {
    if (!token) {
      throw new BadRequestException('TOKEN_REQUIRED');
    }

    const record = await this.prismaService.emailVerification.findUnique({
      where: { token },
    });

    if (!record) {
      throw new BadRequestException('INVALID_TOKEN');
    }

    if (record.verified) {
      throw new BadRequestException('ALREADY_VERIFIED');
    }

    if (record.expiresAt < new Date()) {
      // 여기서 토큰을 삭제해야겠네....
      await this.prismaService.emailVerification.delete({
        where: { token },
      });
      throw new BadRequestException('TOKEN_EXPIRED');
    }

    await this.prismaService.$transaction([
      this.prismaService.emailVerification.update({
        where: { token },
        data: { verified: true },
      }),
      this.prismaService.user.update({
        where: { id: record.userId },
        data: { status: UserStatus.ACTIVE },
      }),
    ]);

    return true;
  }
}
