import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import {AuthService} from '../services/auth.service';
import {map} from 'rxjs';

export const redirectIfLoggedInGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.loadMe$().pipe(
    map(me => {
      const isAdmin = !!me && (me.roles?.includes('ROLE_ADMIN') ?? false);
      return isAdmin ? router.createUrlTree(['/admin', 'dashboard']) : true;
    })
  );
};
