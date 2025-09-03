import {TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {adminGuard} from './admin-guard';
import {AuthService, Me} from '../services/auth.service';
import {firstValueFrom, isObservable, of} from 'rxjs';

async function resolveGuardResult(result: any): Promise<any> {
  if (isObservable(result)) return firstValueFrom(result as any);
  if (result && typeof result.then === 'function') return await result;
  return Promise.resolve(result);
}

describe('adminGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let authMock: { loadMe$: jasmine.Spy<() => any> };

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl'], { url: '/' });
    authMock = { loadMe$: jasmine.createSpy('loadMe$') };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: authMock },
      ],
    });
  });

  function runGuard() {
    return TestBed.runInInjectionContext(() =>
      adminGuard({} as any, {} as any)
    );
  }

  it('should deny and redirect when user is anonymous (null)', async () => {
    authMock.loadMe$.and.returnValue(of(null));

    const result = await resolveGuardResult(runGuard());
    expect(result).toBeFalse();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/admin');
  });

  it('should deny and redirect when user is not admin', async () => {
    const me: Me = { email: 'user@example.com', roles: ['ROLE_USER'] };
    authMock.loadMe$.and.returnValue(of(me));

    const result = await resolveGuardResult(runGuard());
    expect(result).toBeFalse();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/admin');
  });

  it('should allow when user has ROLE_ADMIN', async () => {
    const me: Me = { email: 'admin@example.com', roles: ['ROLE_ADMIN'] };
    authMock.loadMe$.and.returnValue(of(me));

    const result = await resolveGuardResult(runGuard());
    expect(result).toBeTrue();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
