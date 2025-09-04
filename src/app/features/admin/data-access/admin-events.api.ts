import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminEventsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  createEvent(body: PostEventRequest) {
    return this.http.post<PostEventResponse>(`${this.baseUrl}/v1/events`, body);
  }

  login(body: PostAuthRequest) {
    return this.http.post<PostAuthResponse>(`${this.baseUrl}/auth/login`, body);
  }
}
