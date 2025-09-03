import {TestBed} from '@angular/core/testing';
import {HttpClient, provideHttpClient, withInterceptors} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {authInterceptor} from './auth-interceptor';
import {Router} from '@angular/router';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl'], { url: '/' });

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
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

  it('should navigate to /admin on 401 when current url starts with /admin', () => {
    Object.defineProperty(router, 'url', { value: '/admin/dashboard' });

    http.get('/api/v1/protected').subscribe({
      error: () => {}
    });

    const req = httpMock.expectOne('/api/v1/protected');
    req.flush({ message: 'unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(router.navigateByUrl).toHaveBeenCalledWith('/admin');
  });

  it('should not add Authorization header', () => {
    http.get('/api/v1/events').subscribe({
      error: () => {}
    });

    const req = httpMock.expectOne('/api/v1/events');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({ message: 'unauthorized' }, { status: 401, statusText: 'Unauthorized' });
  });

  it('should not navigate on 401 when current url is public', () => {
    Object.defineProperty(router, 'url', { value: '/' });

    http.get('/api/v1/protected').subscribe({
      error: () => {}
    });

    const req = httpMock.expectOne('/api/v1/protected');
    req.flush({ message: 'unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
