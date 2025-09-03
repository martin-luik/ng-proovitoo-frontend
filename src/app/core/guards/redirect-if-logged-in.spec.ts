import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { of, firstValueFrom, isObservable } from 'rxjs';
import { redirectIfLoggedInGuard } from './redirect-if-logged-in.guard';
import { AuthService } from '../services/auth.service';

interface Me { email: string; roles: string[]; }

describe('redirectIfLoggedInGuard', () => {
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['loadMe$']);
    router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });
  });

  async function resolveGuardResult<T = boolean | UrlTree>(value: any): Promise<T> {
    return isObservable(value) ? (await firstValueFrom(value)) as T : Promise.resolve(value as T);
  }

  function runGuard() {
    return TestBed.runInInjectionContext(() =>
      redirectIfLoggedInGuard({} as any, {} as any)
    );
  }

  it('should allow when anonymous (returns true)', async () => {
    auth.loadMe$.and.returnValue(of(null));

    const result = await resolveGuardResult(runGuard());

    expect(result).toBeTrue();
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });
  
  it('should redirect to /admin/dashboard when ADMIN (returns UrlTree)', async () => {
    const admin: Me = { email: 'admin@example.com', roles: ['ROLE_ADMIN'] };
    auth.loadMe$.and.returnValue(of(admin));

    const tree = {} as UrlTree;
    router.createUrlTree.and.returnValue(tree);

    const result = await resolveGuardResult<UrlTree>(runGuard());

    expect(router.createUrlTree).toHaveBeenCalledWith(['/admin', 'dashboard']);
    expect(result).toBe(tree);
  });
});
