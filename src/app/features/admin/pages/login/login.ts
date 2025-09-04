import {Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '../../../../core/services/auth.service';
import {AdminEventsApi} from '../../data-access/admin-events.api';
import {TranslateModule} from '@ngx-translate/core';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AdminEventsApi);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  errorMsg = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(3)]],
  });

  submit() {
    this.errorMsg = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;

    const { email, password } = this.form.getRawValue();
    this.api.login({email: email!, password: password!}).subscribe({
      next: response => {
        this.auth.setToken(response.token);
        this.router.navigateByUrl('/admin/dashboard');
      },
      error: err => {
        this.errorMsg = err?.error?.message ?? 'Wrong e-mail or password';
        this.loading = false;
      }
    });
  }
}
