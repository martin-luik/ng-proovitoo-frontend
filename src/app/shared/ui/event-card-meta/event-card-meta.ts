import {Component, Input} from '@angular/core';
import {DatePipe} from "@angular/common";
import {TranslateModule} from '@ngx-translate/core';

@Component({
  selector: 'app-event-card-meta',
  standalone: true,
  imports: [
    DatePipe,
    TranslateModule
  ],
  templateUrl: './event-card-meta.html',
  styleUrl: './event-card-meta.scss'
})
export class EventCardMeta {
  @Input() startsAt = '';
  @Input() capacity = 0;
}
