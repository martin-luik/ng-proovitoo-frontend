import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { EventsList } from './events-list';
import { EventsApi } from '../../data-access/events.api';
import { TranslateModule } from '@ngx-translate/core';
import { EventSummary } from '@shared/models/event.model';

describe('EventsList', () => {
  let comp: EventsList;
  let router: jasmine.SpyObj<Router>;
  let api: jasmine.SpyObj<EventsApi>;

  const firstBatch: EventSummary[] = [
    {
      id: 1,
      name: 'Weekend',
      startsAt: '2025-09-16T23:52:00Z',
      capacity: 2,
      registeredCount: 0,
      available: 2,
      status: 'OPEN',
    } as any,
  ];

  const secondBatch: EventSummary[] = [
    {
      id: 2,
      name: 'Hackday',
      startsAt: '2025-09-20T10:00:00Z',
      capacity: 10,
      registeredCount: 3,
      available: 7,
      status: 'OPEN',
    } as any,
  ];

  beforeEach(() => {
    api = jasmine.createSpyObj<EventsApi>('EventsApi', ['getEvents']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [
        EventsList,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: EventsApi, useValue: api },
        { provide: Router, useValue: router },
      ],
    });

    const fixture = TestBed.createComponent(EventsList);
    comp = fixture.componentInstance;
  });

  it('should load events on init and set signal', fakeAsync(() => {
    api.getEvents.and.returnValue(of(firstBatch));
    comp.ngOnInit();

    expect(api.getEvents).toHaveBeenCalledTimes(1);
    expect(comp.events()).toEqual(firstBatch);
  }));

  it('should poll every 60s and update list', fakeAsync(() => {
    api.getEvents.and.returnValue(of(firstBatch));

    comp.ngOnInit();
    expect(api.getEvents).toHaveBeenCalledTimes(1);
    expect(comp.events()).toEqual(firstBatch);

    api.getEvents.and.returnValue(of(secondBatch));

    tick(60_000);
    expect(api.getEvents).toHaveBeenCalledTimes(2);
    expect(comp.events()).toEqual(secondBatch);
  }));

  it('should stop polling after ngOnDestroy', fakeAsync(() => {
    api.getEvents.and.returnValue(of(firstBatch));

    comp.ngOnInit();
    expect(api.getEvents).toHaveBeenCalledTimes(1);

    comp.ngOnDestroy();

    tick(180_000);
    expect(api.getEvents).toHaveBeenCalledTimes(1);
  }));

  it('should navigate to registration details', () => {
    comp.navigateToRegistrations(42);
    expect(router.navigate).toHaveBeenCalledWith(['/events', 42, 'registrations']);
  });
});
