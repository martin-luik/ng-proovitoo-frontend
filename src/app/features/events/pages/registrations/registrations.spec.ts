import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Registrations } from './registrations';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import {EventsApi} from '../../data-access/events.api';
import {NotificationService} from '../../../../core/services/notification.service';

type EventsApiMock = jasmine.SpyObj<{ register: (id: number, body: any) => any }>;
type NotificationMock = jasmine.SpyObj<{ success: (m: string) => void; error: (m: string) => void }>;

describe('Registrations', () => {
  let component: Registrations;
  let router: jasmine.SpyObj<Router>;
  let api: EventsApiMock;
  let notify: NotificationMock;

  beforeEach(async () => {
    api = jasmine.createSpyObj('EventsApi', ['register']);
    notify = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate', 'navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [
        Registrations,
        TranslateModule.forRoot(),
      ],
      providers: [
        provideRouter([]),
        { provide: EventsApi, useValue: api },
        { provide: Router, useValue: router },
        { provide: NotificationService, useValue: notify },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: (_: string) => '123' } } },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Registrations);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should NOT submit when form is invalid', () => {
    component.form.setValue({ firstName: '', lastName: '', personalCode: '' });
    component.register(123);
    expect(api.register).not.toHaveBeenCalled();
  });

  it('should call API and on success show toast, reset form and navigate home', () => {
    component.form.setValue({ firstName: 'Tom', lastName: 'Kruus', personalCode: '12345678901' });

    api.register.and.returnValue(of({}));

    component.register(123);

    expect(api.register).toHaveBeenCalledWith(123, {
      firstName: 'Tom',
      lastName: 'Kruus',
      personalCode: '12345678901',
    });

    expect(notify.success).toHaveBeenCalledWith('events.pages.registrations.notify.success');

    expect(component.form.getRawValue()).toEqual({
      firstName: '',
      lastName: '',
      personalCode: '',
    });

    expect(router.navigate).toHaveBeenCalledWith(['']);
  });

  it('should set errorMsg and show error toast when API fails (with backend message)', () => {
    component.form.setValue({ firstName: 'Tom', lastName: 'Kruus', personalCode: '123' });

    api.register.and.returnValue(throwError(() => ({ error: { message: 'Already registered' } })));

    component.register(123);

    expect(component.errorMsg).toBe('Already registered');
    expect(notify.error).toHaveBeenCalledWith('Already registered');
    expect(component.loading).toBeFalse();
  });

  it('should set default translated error when API fails without message', () => {
    component.form.setValue({ firstName: 'Tom', lastName: 'Kruus', personalCode: '123' });

    api.register.and.returnValue(throwError(() => ({ error: {} })));

    component.register(123);

    const fallbackKey = 'events.pages.registrations.notify.error';
    expect(component.errorMsg).toBe(fallbackKey);
    expect(notify.error).toHaveBeenCalledWith(fallbackKey);
    expect(component.loading).toBeFalse();
  });

  it('should navigate to /events when navigateToEvents() is called', () => {
    component.navigateToEvents();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/events');
  });
});
