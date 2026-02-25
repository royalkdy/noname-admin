import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '@/common/error-code';
import { PrismaService } from '@/common/prisma/prisma.service';
import { OAuthProvider } from '@prisma/client';
import { OAuthPayload } from '@/auth/types/auth.types';
import { UserStatus } from '@/user/user.enums';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        email: true,
        status: true,
        nickname: true,
      },
    });

    if (!user) {
      throw new HttpException(ErrorCode.USER_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        status: true,
        nickname: true,
      },
    });
    if (!user) {
      return null;
    }
    return user;
  }

  async findUserWithPasswordByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        status: true,
        nickname: true,
        password: true,
      },
    });
    if (!user) {
      return null;
    }
    return user;
  }

  async createLocalUser(email: string, password: string, nickname: string) {
    const user = await this.prisma.user.create({
      data: {
        email,
        password,
        nickname,
      },
      select: {
        id: true,
        email: true,
        status: true,
        nickname: true,
      },
    });
    return user;
  }

  async findByOAuth(provider: OAuthProvider, providerUserId: string) {
    return await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider,
          providerUserId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nickname: true,
            status: true,
          },
        },
      },
    });
  }

  async createOAuthUser(data: OAuthPayload) {
    return await this.prisma.user.create({
      data: {
        email: data.email,
        nickname: data.nickname ?? `user_${data.providerUserId.slice(0, 6)}`,
        // OAuth는 이메일 인증이 불필요 바로 활성화
        status: UserStatus.ACTIVE,
        oauths: {
          create: {
            provider: data.provider,
            providerUserId: data.providerUserId,
          },
        },
      },
    });
  }
}
