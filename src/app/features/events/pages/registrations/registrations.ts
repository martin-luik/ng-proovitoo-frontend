import {Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {EventsApi} from '../../data-access/events.api';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {NotificationService} from '../../../../core/services/notification.service';

@Component({
  selector: 'app-registrations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './registrations.html',
  styleUrl: './registrations.scss'
})
export class Registrations {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(EventsApi);
  private readonly notify = inject(NotificationService);
  private readonly translate = inject(TranslateService);

  loading = false;
  errorMsg = '';

  form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    personalCode: ['', Validators.required],
  });

  readonly id = Number(this.route.snapshot.paramMap.get('id'));


  register(id: number) {
    this.errorMsg = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;

    this.api.register(id, this.form.getRawValue()).subscribe({
      next: () => {
        const msg = this.translate.instant('events.pages.registrations.notify.success');
        this.notify.success(msg);
        this.form.reset();
        void this.router.navigate(['']);
      },
      error: err => {
        const code = err?.error?.code;
        const defaultErrorMsg = this.translate.instant('events.pages.registrations.notify.error');

        if (code) {
          const translated = this.translate.instant(`errors.${code}`);
          this.errorMsg = translated !== `errors.${code}`
            ? translated
            : (err?.error?.message ?? defaultErrorMsg);
        } else {
          this.errorMsg = err?.error?.message ?? defaultErrorMsg;
        }

        this.notify.error(this.errorMsg);
        this.loading = false;
      }
    });
  }

  navigateToEvents() {
    void this.router.navigateByUrl('/events');
  }
}
