// dashboard.spec.ts
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

import { Dashboard } from './dashboard';
import { EventsApi } from '../../../events/data-access/events.api';
import { TranslateModule } from '@ngx-translate/core';

describe('Dashboard', () => {
  let api: jasmine.SpyObj<EventsApi>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    api = jasmine.createSpyObj<EventsApi>('EventsApi', ['getEvents']);
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [
        Dashboard,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: EventsApi, useValue: api },
        { provide: Router, useValue: router },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('should load events on init and store in signal', () => {
    const mockEvents = [
      {
        id: 1,
        name: 'Event A',
        capacity: 10,
        registrationsCount: 3,
        availableSeats: 7,
        startsAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: 'Event B',
        capacity: 5,
        registrationsCount: 5,
        availableSeats: 0,
        startsAt: new Date().toISOString(),
      },
    ];

    api.getEvents.and.returnValue(of(mockEvents));

    const fixture = TestBed.createComponent(Dashboard);
    const comp = fixture.componentInstance;

    fixture.detectChanges();

    expect(api.getEvents).toHaveBeenCalled();
    expect(comp.events()).toEqual(mockEvents);
  });

  it('should navigate to /admin/add-event when navigateToAddEvent() is called', () => {
    api.getEvents.and.returnValue(of([]));

    const fixture = TestBed.createComponent(Dashboard);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.navigateToAddEvent();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/add-event');
  });
});
