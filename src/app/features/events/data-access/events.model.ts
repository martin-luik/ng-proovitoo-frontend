export interface EventSummary {
  id: number;
  name: string;
  startsAt: string;
  capacity: number;
  registrationsCount: number;
  availableSeats: number;
}

export interface Registration {
  firstName: string;
  lastName: string;
  personalCode: string;
}
