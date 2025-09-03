import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {map, tap} from 'rxjs';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.loadMe$().pipe(
    map(me => !!me && (me.roles?.includes('ROLE_ADMIN') ?? false)),
    tap(ok => {
      if (!ok) void router.navigateByUrl('/admin');
    })
  );
};

