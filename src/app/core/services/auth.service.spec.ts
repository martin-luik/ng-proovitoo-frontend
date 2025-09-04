import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  const TOKEN_KEY = 'token';
  const EXPECTED_TOKEN = 'any-token';

  beforeEach(() => {
    authService = new AuthService();
    sessionStorage.clear();
  });

  it('should store and read token from sessionStorage', () => {
    expect(authService.isLoggedIn()).toBeFalse();
    authService.setToken(EXPECTED_TOKEN);
    expect(sessionStorage.getItem(TOKEN_KEY)).toBe(EXPECTED_TOKEN);
    expect(authService.getToken()).toBe(EXPECTED_TOKEN);
    expect(authService.isLoggedIn()).toBeTrue();
  });

  it('should remove token on logout', () => {
    sessionStorage.setItem(TOKEN_KEY, EXPECTED_TOKEN);
    authService.logout();
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(authService.isLoggedIn()).toBeFalse();
  });
});
