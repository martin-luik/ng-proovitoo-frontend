import {Component, inject} from '@angular/core';
import {NotificationService} from '../../services/notification.service';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [NgClass],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.scss'
})
export class ToastContainer {
  notify = inject(NotificationService);
}
