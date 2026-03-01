import {
  Injectable,
  HttpException,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/common/prisma/prisma.service';
import { AdminStatus } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ErrorCode } from '@/common/error-code';
import { AdminRole } from '@/auth/types/admin-role.enum';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validate(email: string, password: string) {
    const admin = await this.prismaService.admin.findUnique({
      where: { email },
    });

    if (!admin) return null;

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return null;

    if (admin.status === AdminStatus.PENDING)
      throw new ForbiddenException(ErrorCode.ADMIN_APPROVAL_REQUIRED);

    if (admin.status === AdminStatus.BLOCKED)
      throw new ForbiddenException(ErrorCode.BLOCKED_USER);

    return admin;
  }

  // JWT 발급
  async issueAccessToken(
    userId: number,
    role: AdminRole,
  ): Promise<{ accessToken: string }> {
    const payload = { sub: userId, role };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async createAdmin(email: string, password: string, name: string) {
    const isExistUser = await this.prismaService.admin.findUnique({
      where: { email },
    });

    if (isExistUser) {
      throw new HttpException(
        ErrorCode.USER_ALREADY_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const encryptedPassword = bcrypt.hashSync(password, 10);
    const resultUserinfo = await this.prismaService.admin.create({
      data: {
        email: email,
        password: encryptedPassword,
        name: name,
      },
    });
    return resultUserinfo;
  }
}
