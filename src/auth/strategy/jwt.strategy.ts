import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ErrorCode } from '@/common/error-code';
import { AdminStatus } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: { sub: number }) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.sub },
    });

    if (!admin) throw new UnauthorizedException(ErrorCode.USER_NOT_FOUND);
    if (admin.status === AdminStatus.BLOCKED)
      throw new ForbiddenException(ErrorCode.BLOCKED_USER);

    return { adminId: admin.id };
  }
}
