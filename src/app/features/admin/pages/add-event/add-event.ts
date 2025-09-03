import {Component, inject} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {AdminEventsApi} from '../../data-access/admin-events.api';
import {AuthService} from '../../../../core/services/auth.service';
import {Router} from '@angular/router';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {NotificationService} from '../../../../core/services/notification.service';

@Component({
  selector: 'app-add-event',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './add-event.html',
  styleUrl: './add-event.scss'
})
export class AddEvent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AdminEventsApi);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);
  private readonly translate = inject(TranslateService);

  auth = inject(AuthService);

  loading = false;
  errorMsg = '';

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    startsAt: ['', Validators.required],
    capacity: [1, [Validators.required, Validators.min(1)]],
  });


  submit() {
    this.errorMsg = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;

    const formRavValue = this.form.getRawValue();
    const startsAtIso = new Date(formRavValue.startsAt as unknown as string).toISOString();
    this.api.createEvent({...formRavValue, startsAt: startsAtIso} as PostEventRequest).subscribe({
      next: () => {
        const msg = this.translate.instant('admin.pages.addEvent.notify.success');
        this.notify.success(msg);
        this.form.reset({ capacity: 1 });
        this.navigateToDashboard();
      },
      error: err => {
        const defaultErrorMsg = this.translate.instant('admin.pages.addEvent.notify.error');
        this.errorMsg = err?.error?.message ?? defaultErrorMsg;
        this.notify.error(this.errorMsg);
        this.loading = false;
      }
    });
  }


  isLoggedIn() {
    return this.auth.isLoggedIn();
  }

  navigateToDashboard() {
    this.router.navigateByUrl('/admin/dashboard');
  }
}
