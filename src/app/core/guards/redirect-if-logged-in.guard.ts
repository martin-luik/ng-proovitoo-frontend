import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import {AuthService} from '../services/auth.service';

export const redirectIfLoggedInGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isLoggedIn() ? inject(Router).parseUrl('/admin/dashboard') : true;
};
