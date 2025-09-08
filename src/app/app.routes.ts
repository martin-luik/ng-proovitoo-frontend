import {Routes} from '@angular/router';
import {Shell} from '@core/layout/shell';


export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('@features/events/events.routes').then(m => m.EVENTS_ROUTES),
      },
      {
        path: 'admin',
        loadChildren: () =>
          import('@features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
