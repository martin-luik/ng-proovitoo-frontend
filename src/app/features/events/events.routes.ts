import {EventsList} from '@features/events/pages/event-list/events-list';
import {Routes} from '@angular/router';
import {Registrations} from '@features/events/pages/registrations/registrations';

export const EVENTS_ROUTES: Routes = [
  { path: '', component: EventsList },
  { path: 'events/:id/registrations', component: Registrations },
];
