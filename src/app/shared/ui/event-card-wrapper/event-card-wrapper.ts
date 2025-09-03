import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-event-card-wrapper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-card-wrapper.html',
  styleUrl: './event-card-wrapper.scss'
})
export class EventCardWrapper {
  @Input() colorCode = 0;
}
