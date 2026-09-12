export interface JwtPayload {
  sub: string;
  email: string;
  tokenType: 'access' | 'refresh';
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
