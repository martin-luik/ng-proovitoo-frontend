import {Component, inject} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {ToastContainer} from '../ui/toast-container/toast-container';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslateModule,
    ToastContainer
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss'
})
export class Shell {
  auth = inject(AuthService);
  private readonly router = inject(Router);

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
