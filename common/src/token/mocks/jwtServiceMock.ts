import { CurrentUser } from '../../shared';
import { TokenIssuer } from '../TokenIssuer';

export const MOCK_TOKEN = 'token';

export const MOCK_CURRENT_USER: CurrentUser = {
  id: '1',
};

export const createTokenIssuerMock = (): TokenIssuer => ({
  generate: () => MOCK_TOKEN,
  validate: () => MOCK_CURRENT_USER,
});
