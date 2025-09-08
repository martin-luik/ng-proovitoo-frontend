interface PostEventRequest {
  name: string;
  startsAt: string;
  capacity: number;
}

interface PostEventResponse {
  id: number;
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
