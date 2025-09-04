import {Routes} from '@angular/router';
import {adminGuard} from './core/guards/admin-guard';
import {EventsList} from './features/events/pages/events/events-list';
import {redirectIfLoggedInGuard} from './core/guards/redirect-if-logged-in.guard';
import {Login} from './features/admin/pages/login/login';
import {Dashboard} from './features/admin/pages/dashboard/dashboard';
import {AddEvent} from './features/admin/pages/add-event/add-event';
import {Registrations} from './features/events/pages/registrations/registrations';
import {Shell} from './core/layout/shell';


export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      {path: '', component: EventsList},
      {path: 'events/:id/registrations', component: Registrations},
      {
        path: 'admin', children: [
          {path: '', component: Login, canActivate: [redirectIfLoggedInGuard]},
          {path: 'dashboard', component: Dashboard, canActivate: [adminGuard]},
          {path: 'add-event', component: AddEvent, canActivate: [adminGuard]}
        ]
      }
    ]
  },
  {path: '**', redirectTo: ''}
];
