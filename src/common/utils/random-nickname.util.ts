import { randomBytes } from 'crypto';

export function generateRandomNickname() {
  return `user_${randomBytes(4).toString('hex')}`;
}
