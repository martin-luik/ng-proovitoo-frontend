import {Component, Input} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';

@Component({
  selector: 'app-event-card-stats',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './event-card-stats.html',
  styleUrl: './event-card-stats.scss'
})
export class EventCardStats {
  @Input() registrationsCount = 0;
  @Input() availableSeats = 0;
}
