import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly KEY = 'token';
  setToken(t: string) { sessionStorage.setItem(this.KEY, t); }
  getToken(): string | null { return sessionStorage.getItem(this.KEY); }
  isLoggedIn(): boolean { return !!this.getToken(); }
  logout() { sessionStorage.removeItem(this.KEY); }
}
