export interface OAuthPayload {
  provider: 'GOOGLE';
  providerUserId: string;
  email?: string;
  nickname?: string;
}

export enum OAuthProvider {
  GOOGLE = 'GOOGLE',
  KAKAO = 'KAKAO',
  NAVER = 'NAVER',
}

export type AuthenticatedAdmin = {
  id: number;
  email: string;
  role: string;
};
