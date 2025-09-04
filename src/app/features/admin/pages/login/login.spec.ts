import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';
import { ReactiveFormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import {AuthService} from '../../../../core/services/auth.service';
import {AdminEventsApi} from '../../data-access/admin-events.api';
import {TranslateModule} from '@ngx-translate/core';

describe('AdminLogin', () => {
  let fixture: ComponentFixture<Login>;
  let comp: Login;
  let api: jasmine.SpyObj<AdminEventsApi>;
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    api = jasmine.createSpyObj('ApiService', ['login']);
    auth = jasmine.createSpyObj('AuthService', ['setToken']);
    router = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        Login,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: AdminEventsApi, useValue: api },
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should block submit when form is invalid', () => {
    comp.form.setValue({ email: '', password: '' });
    comp.submit();
    expect(api.login).not.toHaveBeenCalled();
  });

  it('should store token and navigate on success', () => {
    const anyToken = 'any-token';

    comp.form.setValue({ email: 'admin@example.com', password: 'admin' });
    api.login.and.returnValue(of({ token: anyToken }));
    comp.submit();
    expect(auth.setToken).toHaveBeenCalledWith(anyToken);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('should show error and stop loading on failure', () => {
    comp.form.setValue({ email: 'any@email.com', password: 'anyPassword' });
    api.login.and.returnValue(throwError(() => ({ error: { message: 'Wrong' } })));
    comp.submit();
    expect(comp.errorMsg).toBe('Wrong');
    expect(comp.loading).toBeFalse();
  });
});
