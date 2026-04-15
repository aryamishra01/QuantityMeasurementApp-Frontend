export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
}