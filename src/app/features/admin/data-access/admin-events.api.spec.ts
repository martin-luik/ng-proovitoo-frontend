import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AdminEventsApi } from './admin-events.api';
import { environment } from '../../../../environments/environment';

describe('AdminEventsApi', () => {
  let api: AdminEventsApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminEventsApi,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    api = TestBed.inject(AdminEventsApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should POST /v1/events when calling createEvent()', () => {
    const body = { name: 'Test', startsAt: '2025-01-01T12:00:00', capacity: 10 };
    api.createEvent(body).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/v1/events`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);

    req.flush({ ...body });
  });

  it('should POST /auth/login when calling login()', () => {
    const body = { email: 'any@email.com', password: 'anyPassword' };
    api.login(body).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);

    req.flush({ token: 'any-token' });
  });
});
