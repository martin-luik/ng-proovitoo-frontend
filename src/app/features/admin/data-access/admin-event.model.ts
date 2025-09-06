interface PostEventRequest {
  name: string;
  startsAt: string;
  capacity: number;
}

interface PostEventResponse {
  name: string;
  startsAt: string;
  capacity: number;
}

interface PostAuthRequest {
  email: string;
  password: string;
}

interface PostAuthResponse {
  token: string;
}
