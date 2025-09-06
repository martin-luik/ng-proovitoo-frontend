import {TestBed} from '@angular/core/testing';
import {HttpClient, provideHttpClient, withInterceptors} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {authInterceptor} from './auth-interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Authorization header when token exists', () => {
    sessionStorage.setItem('token', 'any-token');

    http.get('/api/v1/events').subscribe();

    const req = httpMock.expectOne('/api/v1/events');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer any-token');

    req.flush([]);
  });

  it('should not add Authorization header for /auth/login', () => {
    sessionStorage.setItem('token', 'any-token');

    http.post('/auth/login', { email: 'any@email.com', password: 'anyPassword' }).subscribe();

    const req = httpMock.expectOne('/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.has('Authorization')).toBeFalse();

    req.flush({ token: 't' });
  });

  it('should leave request unchanged when no token exists', () => {
    http.get('/api/v1/events').subscribe();

    const req = httpMock.expectOne('/api/v1/events');
    expect(req.request.headers.has('Authorization')).toBeFalse();

    req.flush([]);
  });
});
