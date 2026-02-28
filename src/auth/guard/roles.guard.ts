// common/auth/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@/common/decorators/roles.decorator';
import { AdminRole } from '@/common/enums/admin-role.enum';
import type { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AdminRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 롤 지정 안했으면 통과
    if (!requiredRoles) return true;

    const request: Request = context.switchToHttp().getRequest();
    const user = request.user as { adminId: number; role: AdminRole };

    if (!user?.role) {
      throw new ForbiddenException('ROLE_NOT_FOUND');
    }

    const minRole = Math.min(...requiredRoles);

    if (user.role < minRole) {
      throw new ForbiddenException('INSUFFICIENT_ROLE');
    }

    return true;
  }
}
