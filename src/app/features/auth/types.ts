export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'member';
  active: boolean;
  storageLimitMb?: number;
  lastActiveAt?: string | null;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  statusCode: number;
  message: string;
  token: string;
  user: AuthUser;
}
