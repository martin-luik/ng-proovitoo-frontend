import {redirectIfLoggedInGuard} from '@core/guards/redirect-if-logged-in.guard';
import {Dashboard} from '@features/admin/pages/dashboard/dashboard';
import {Login} from '@features/admin/pages/login/login';
import {adminGuard} from '@core/guards/admin-guard';
import {Routes} from '@angular/router';
import {AddEvent} from '@features/admin/pages/add-event/add-event';

export const ADMIN_ROUTES: Routes = [
  { path: '', component: Login, canActivate: [redirectIfLoggedInGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [adminGuard] },
  { path: 'add-event', component: AddEvent, canActivate: [adminGuard] },
];
