import { AuthUser } from '../../lib';
import { JwtService } from '../jwtService';

export const MOCK_TOKEN = 'token';

export const MOCK_AUTH_USER: AuthUser = {
  id: '1',
  username: 'testuser',
  avatarUrl: null,
};

export const createJwtServiceMock = (): JwtService => ({
  sign: () => MOCK_TOKEN,
  verify: () => MOCK_AUTH_USER,
});
