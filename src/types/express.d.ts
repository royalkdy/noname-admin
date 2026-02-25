import 'express';
import { SessionUser } from '@/auth/session-user.type';

declare global {
  namespace Express {
    type User = SessionUser;
  }
}
