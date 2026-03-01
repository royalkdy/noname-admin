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
import { AdminRole } from '@/auth/types/admin-role.enum';
import { toDomainAdminRole } from '@/common/prisma/prisma-admin-role.mapper';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: { sub: number; role: AdminRole }) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.sub },
    });

    if (!admin) throw new UnauthorizedException(ErrorCode.ADMIN_USER_NOT_FOUND);
    if (admin.status === AdminStatus.BLOCKED)
      throw new ForbiddenException(ErrorCode.BLOCKED_USER);

    return { id: admin.id, role: toDomainAdminRole(admin.role) };
  }
}
