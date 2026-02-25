import { randomBytes } from 'crypto';

export function generateEmailToken(): string {
  return randomBytes(32).toString('hex');
}
