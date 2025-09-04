interface PostEventRequest {
  title: string;
  startAt: string;
  capacity: number;
}

interface PostEventResponse {
  title: string;
  startAt: string;
  capacity: number;
}

interface PostAuthRequest {
  email: string;
  password: string;
}

interface PostAuthResponse {
  token: string;
}
