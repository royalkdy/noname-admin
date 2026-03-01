import { AdminRole as PrismaUserRole } from '@prisma/client';
import { AdminRole } from '../../auth/types/admin-role.enum';

export function toDomainAdminRole(role: PrismaUserRole): AdminRole {
  switch (role) {
    case PrismaUserRole.VIEWER:
      return AdminRole.VIEWER;
    case PrismaUserRole.OPERATOR:
      return AdminRole.OPERATOR;
    case PrismaUserRole.SUPER:
      return AdminRole.SUPER;
  }
}

export function toPrismaAdminRole(role: AdminRole): PrismaUserRole {
  switch (role) {
    case AdminRole.VIEWER:
      return PrismaUserRole.VIEWER;
    case AdminRole.OPERATOR:
      return PrismaUserRole.OPERATOR;
    case AdminRole.SUPER:
      return PrismaUserRole.SUPER;
  }
}
