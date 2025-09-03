import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthService, Me } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should set user on loadMe$ success', () => {
    let received: Me | null = null;
    const expectedMe: Me = { email: 'admin@example.com', roles: ['ROLE_ADMIN'] };

    service.loadMe$().subscribe(v => (received = v));

    const req = httpMock.expectOne('/auth/me');
    expect(req.request.method).toBe('GET');
    req.flush(expectedMe);

    expect(service.isLoggedIn()).toBeTrue();
    expect(received as Me | null).toEqual(expectedMe);
  });

  it('should set null on loadMe$ 401', () => {
    let received: Me | null = {} as any;

    service.loadMe$().subscribe(v => (received = v));

    const req = httpMock.expectOne('/auth/me');
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(service.isLoggedIn()).toBeFalse();
    expect(received).toBeNull();
  });

  it('should post credentials and then fetch me on login', () => {
    let me: Me | null = null;

    service.login('admin@example.com', 'admin').subscribe(v => (me = v));

    const loginReq = httpMock.expectOne('/auth/login');
    expect(loginReq.request.method).toBe('POST');
    expect(loginReq.request.body).toEqual({ email: 'admin@example.com', password: 'admin' });
    loginReq.flush(null);

    const meReq = httpMock.expectOne('/auth/me');
    meReq.flush({ email: 'admin@example.com', roles: ['ROLE_ADMIN'] });

    expect(me as Me | null).toEqual({ email: 'admin@example.com', roles: ['ROLE_ADMIN'] });
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('should clear user after POST /auth/logout', () => {
    (service as any)._user.set({ email: 'x', roles: [] });

    service.logout().subscribe();

    const req = httpMock.expectOne('/auth/logout');
    expect(req.request.method).toBe('POST');
    req.flush(null);

    expect(service.isLoggedIn()).toBeFalse();
  });
});
