import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '@env/environment';
import {EventSummary, PostRegistrationRequest, PostRegistrationResponse} from './events.model';

@Injectable({providedIn: 'root'})
export class EventsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getEvents() {
    return this.http.get<EventSummary[]>(`${this.baseUrl}/v1/events`);
  }

  register(eventId: number, body: PostRegistrationRequest) {
    return this.http.post<PostRegistrationResponse>(`${this.baseUrl}/v1/events/${eventId}/registrations`, body);
  }
}
