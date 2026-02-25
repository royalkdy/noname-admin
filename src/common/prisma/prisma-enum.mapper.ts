import {
  UserStatus as PrismaUserStatus,
  OAuthProvider as PrismaOAuthProvider,
} from '@prisma/client';

import { UserStatus } from '@/user/user.enums';
import { OAuthProvider } from '@/auth/types/auth.types';

/* =========================
   UserStatus
========================= */

export function toDomainUserStatus(status: PrismaUserStatus): UserStatus {
  return status as UserStatus;
}

export function toPrismaUserStatus(status: UserStatus): PrismaUserStatus {
  return status as PrismaUserStatus;
}

/* =========================
   OAuthProvider
========================= */
export function toDomainOAuthProvider(
  provider: PrismaOAuthProvider,
): OAuthProvider {
  return provider as OAuthProvider;
}
export function toPrismaOAuthProvider(
  provider: OAuthProvider,
): PrismaOAuthProvider {
  return provider as PrismaOAuthProvider;
}
