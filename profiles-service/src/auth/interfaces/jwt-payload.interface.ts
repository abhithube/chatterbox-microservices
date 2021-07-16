export interface JwtPayload {
  sub: string;
  username: string;
  avatarUrl?: string;
  iat: number;
  exp: number;
}
