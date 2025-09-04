import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { adminGuard } from './admin-guard';

describe('adminGuard', () => {
  let router: jasmine.SpyObj<Router>;
  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['createUrlTree']);
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: router }]
    });
    sessionStorage.clear();
  });

  it('should allow when logged in', () => {
    sessionStorage.setItem('token', 'x');
    const res = TestBed.runInInjectionContext(() =>
      adminGuard({} as ActivatedRouteSnapshot, { url: '/' } as RouterStateSnapshot)
    );
    expect(res).toBeTrue();
  });

  it('should redirect to /admin when not logged in', () => {
    const tree = {} as any;
    router.createUrlTree.and.returnValue(tree);
    const res = TestBed.runInInjectionContext(() =>
      adminGuard({} as ActivatedRouteSnapshot, { url: '/admin/dashboard' } as RouterStateSnapshot)
    );
    expect(res).toBe(tree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/admin']);
  });
});
