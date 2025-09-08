export interface EventSummaryResponse {
  id: number;
  name: string;
  startsAt: string;
  capacity: number;
  registrationsCount: number;
  availableSeats: number;
}

export interface PostRegistrationRequest {
  firstName: string;
  lastName: string;
  personalCode: string;
}

export interface PostRegistrationResponse {
  id: number;
  eventId: number;
}
