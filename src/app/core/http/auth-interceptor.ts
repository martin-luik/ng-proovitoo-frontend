import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {AuthService} from '../services/auth.service';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, throwError} from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isLogin = req.url.includes('/auth/login');
  const token = auth.getToken();

  if (token && !isLogin) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        auth.logout();
        router.navigateByUrl('/admin');
      }
      return throwError(() => err);
    })
  );
};
