import {Component, inject, OnInit, signal} from '@angular/core';
import {EventsApi} from '../../../events/data-access/events.api';
import {Router} from '@angular/router';
import {EventCardGrid} from '@shared/ui/event-card-grid/event-card-grid';
import {EventCardWrapper} from '@shared/ui/event-card-wrapper/event-card-wrapper';
import {EventCardHeader} from '@shared/ui/event-card-header/event-card-header';
import {EventCardMeta} from '@shared/ui/event-card-meta/event-card-meta';
import {EventCardStats} from '@shared/ui/event-card-stats/event-card-stats';
import {TranslateModule} from '@ngx-translate/core';
import {EventSummary} from '@features/events/data-access/events.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    EventCardGrid,
    EventCardWrapper,
    EventCardHeader,
    EventCardMeta,
    EventCardStats,
    TranslateModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {

  private readonly api = inject(EventsApi);
  private readonly router = inject(Router);


  events = signal<EventSummary[]>([]);

  ngOnInit() { this.api.getEvents().subscribe(e => this.events.set(e)); }

  navigateToAddEvent() {
    void this.router.navigateByUrl('/admin/add-event');
  }
}
