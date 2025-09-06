import {Component, Input} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';

@Component({
  selector: 'app-event-card-header',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './event-card-header.html',
  styleUrl: './event-card-header.scss'
})
export class EventCardHeader {
  @Input() title = '';
  @Input() availableSeats = 0;
}
