import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {EventsApi} from '../../data-access/events.api';
import {Router} from '@angular/router';
import {EventCardGrid} from '@shared/ui/event-card-grid/event-card-grid';
import {EventCardWrapper} from '@shared/ui/event-card-wrapper/event-card-wrapper';
import {EventCardMeta} from '@shared/ui/event-card-meta/event-card-meta';
import {EventCardStats} from '@shared/ui/event-card-stats/event-card-stats';
import {EventCardHeader} from '@shared/ui/event-card-header/event-card-header';
import {TranslateModule} from '@ngx-translate/core';
import {interval, Subject, switchMap, takeUntil} from 'rxjs';
import {EventSummary} from '@features/events/data-access/events.model';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EventCardGrid,
    EventCardWrapper,
    EventCardHeader,
    EventCardMeta,
    EventCardStats,
    TranslateModule
  ],
  templateUrl: './events-list.html',
  styleUrl: './events-list.scss'
})
export class EventsList implements OnInit, OnDestroy {
  private readonly api = inject(EventsApi);
  private readonly router = inject(Router);

  private readonly destroy$ = new Subject<void>();

  events = signal<EventSummary[]>([]);

  ngOnInit() {
    this.api.getEvents().subscribe(e => this.events.set(e));

    interval(60_000)
      .pipe(
        switchMap(() => this.api.getEvents()),
        takeUntil(this.destroy$)
      )
      .subscribe(e => this.events.set(e));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  navigateToRegistrations(id: number) {
    this.router.navigate(['/events', id, 'registrations']);
  }
}
