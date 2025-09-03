import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AddEvent } from './add-event';
import { AdminEventsApi } from '../../data-access/admin-events.api';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('AddEvent', () => {
  let fixture: ComponentFixture<AddEvent>;
  let comp: AddEvent;
  let api: jasmine.SpyObj<AdminEventsApi>;
  let router: jasmine.SpyObj<Router>;
  let notify: jasmine.SpyObj<NotificationService>;
  let translate: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    api = jasmine.createSpyObj('AdminEventsApi', ['createEvent']);
    router = jasmine.createSpyObj('Router', ['navigateByUrl']);
    notify = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    translate = jasmine.createSpyObj('TranslateService', ['instant']);
    translate.instant.and.callFake((k: string) => k);

    await TestBed.configureTestingModule({
      imports: [
        AddEvent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: AdminEventsApi, useValue: api },
        { provide: Router, useValue: router },
        { provide: NotificationService, useValue: notify },
        { provide: AuthService, useValue: { isLoggedIn: () => true } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddEvent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not submit when form invalid', () => {
    comp.form.setValue({ name: '', startsAt: '', capacity: 0 });
    comp.submit();

    expect(api.createEvent).not.toHaveBeenCalled();
    expect(comp.loading).toBeFalse();
  });

  it('should call API and navigate on success', () => {
    api.createEvent.and.returnValue(of({} as PostEventResponse));

    comp.form.setValue({
      name: 'Hackathon',
      startsAt: '2025-09-20T12:00',
      capacity: 50
    });

    comp.submit();

    expect(api.createEvent).toHaveBeenCalled();
    expect(notify.success).toHaveBeenCalledWith('admin.pages.addEvent.notify.success');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/dashboard');
    expect(comp.form.value.capacity).toBe(1);
  });

  it('should show error and not navigate on failure', () => {
    api.createEvent.and.returnValue(
      throwError(() => ({ error: { message: 'Server error' } }))
    );

    comp.form.setValue({
      name: 'Hackathon',
      startsAt: '2025-09-20T12:00',
      capacity: 50
    });

    comp.submit();

    expect(notify.error).toHaveBeenCalledWith('Server error');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(comp.loading).toBeFalse();
    expect(comp.errorMsg).toBe('Server error');
  });

  it('should expose isLoggedIn()', () => {
    expect(comp.isLoggedIn()).toBeTrue();
  });
});
