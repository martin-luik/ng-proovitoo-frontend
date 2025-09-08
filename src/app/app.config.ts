import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {HttpInterceptorFn, provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {TranslateModule} from '@ngx-translate/core';
import {provideTranslateHttpLoader} from '@ngx-translate/http-loader';
import {authInterceptor} from '@core/interceptors/http/auth-interceptor';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const isApi = req.url.startsWith('/auth') || req.url.startsWith('/v1');
  return next(isApi ? req.clone({withCredentials: true}) : req);
};


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),

    provideHttpClient(
      withFetch(),
      withInterceptors([credentialsInterceptor, authInterceptor])
    ),

    importProvidersFrom(TranslateModule.forRoot()),
    provideTranslateHttpLoader({prefix: '/assets/i18n/', suffix: '.json'}),
  ],
};
