export interface JwtPayload {
  id: string;
  username: string;
  avatarUrl?: string;
  iat: number;
  exp: number;
}
