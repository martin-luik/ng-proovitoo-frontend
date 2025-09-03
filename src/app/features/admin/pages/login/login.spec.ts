import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Login} from './login';
import {ReactiveFormsModule} from '@angular/forms';

import {Router} from '@angular/router';
import {of, throwError} from 'rxjs';
import {AuthService} from '../../../../core/services/auth.service';
import {TranslateModule} from '@ngx-translate/core';

describe('AdminLogin', () => {
  let fixture: ComponentFixture<Login>;
  let comp: Login;
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['login']);
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        Login,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should block submit when form is invalid', () => {
    comp.form.setValue({ email: '', password: '' });
    comp.submit();
    expect(auth.login).not.toHaveBeenCalled();
  });

  it('should navigate to dashboard on successful login', () => {
    comp.form.setValue({ email: 'admin@example.com', password: 'admin' });

    auth.login.and.returnValue(of({ email: 'admin@example.com', roles: ['ROLE_ADMIN'] }));

    comp.submit();

    expect(auth.login).toHaveBeenCalledWith('admin@example.com', 'admin');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('should show server error and stop loading on failure', () => {
    comp.form.setValue({ email: 'any@email.com', password: 'wrong' });

    auth.login.and.returnValue(throwError(() => ({ error: { message: 'Wrong' } })));

    comp.submit();

    expect(comp.errorMsg).toBe('Wrong');
    expect(comp.loading).toBeFalse();
  });
});
