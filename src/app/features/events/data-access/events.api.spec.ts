import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { EventsApi } from './events.api';
import { environment } from '@env/environment';
import {EventSummary, Registration} from './events.model';

describe('EventsApi', () => {
  let api: EventsApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EventsApi,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    api = TestBed.inject(EventsApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should GET /v1/events when calling getEvents()', () => {
    const mock: EventSummary[] = [
      { id: 1, name: 'Any event', startsAt: '2025-01-01T12:00:00', capacity: 10, registrationsCount: 0, availableSeats: 10 }
    ];

    let result: EventSummary[] | undefined;
    api.getEvents().subscribe(r => (result = r));

    const req = httpMock.expectOne(`${environment.apiUrl}/v1/events`);
    expect(req.request.method).toBe('GET');

    req.flush(mock);

    expect(result).toBeTruthy();
    expect(result!.length).toBe(1);
    expect(result![0].id).toBe(1);
  });

  it('should POST /v1/events/:id/registrations when calling register()', () => {
    const body: Registration = { firstName: 'Firstname', lastName: 'LastName', personalCode: '11111111111' };
    const eventId = 42;

    let res: Registration | undefined;
    api.register(eventId, body).subscribe(r => (res = r));

    const req = httpMock.expectOne(`${environment.apiUrl}/v1/events/${eventId}/registrations`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);

    req.flush(body);

    expect(res).toEqual(body);
  });

  it('should propagate HTTP errors', () => {
    const eventId = 1;
    const body: Registration = { firstName: 'Firstname', lastName: 'LastName', personalCode: '11111111111' };

    let errorStatus: number | undefined;
    api.register(eventId, body).subscribe({
      next: () => fail('expected error'),
      error: (e) => (errorStatus = e.status),
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/v1/events/${eventId}/registrations`);
    req.flush({ message: 'CONFLICT' }, { status: 409, statusText: 'CONFLICT' });

    expect(errorStatus).toBe(409);
  });
});
