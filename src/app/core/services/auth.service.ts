import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, firstValueFrom, of, switchMap, tap} from 'rxjs';
import {environment} from '../../../environments/environment';

export interface Me { email: string; roles: string[]; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly _user = signal<Me | null>(null);

  private readonly baseUrl = environment.apiUrl;


  user = this._user.asReadonly();
  isLoggedIn() { return this._user() !== null; }
  isAdmin() { return this._user()?.roles?.includes('ROLE_ADMIN') ?? false; }

  loadMe$() {
    return this.http.get<Me>(`${this.baseUrl}/auth/me`).pipe(
      tap({
        next: me => this._user.set(me),
        error: () => this._user.set(null),
      }),
      catchError(() => of(null))
    );
  }

  async loadMeOnce(): Promise<void> {
    await firstValueFrom(this.loadMe$());
  }

  login(email: string, password: string) {
    return this.http.post<void>(`${this.baseUrl}/auth/login`, { email, password }).pipe(
      switchMap(() => this.loadMe$())
    );
  }

  logout() {
    return this.http.post<void>(`${this.baseUrl}/auth/logout`, {}).pipe(
      tap(() => this._user.set(null))
    );
  }
}
