import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

const AUTH_TOKEN_KEY = 'token';
const AUTH_USER_KEY = 'authUser';
const AUTH_ROLES_KEY = 'roles';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, payload).pipe(
      timeout(30000),
      catchError(error => {
        console.error('Login request error:', error);
        throw error;
      })
    );
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, payload).pipe(
      timeout(30000),
      catchError(error => {
        console.error('Register request error:', error);
        throw error;
      })
    );
  }

  saveAuth(response: AuthResponse): void {
    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    localStorage.setItem(
      AUTH_USER_KEY,
      JSON.stringify({
        id: response.id,
        username: response.username,
        email: response.email,
        fullName: response.fullName,
        roles: response.roles
      })
    );
    localStorage.setItem(AUTH_ROLES_KEY, JSON.stringify(response.roles));
  }

  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  getStoredUser(): { id: number; username: string; email: string; fullName: string; roles: string[] } | null {
    const userJson = localStorage.getItem(AUTH_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_ROLES_KEY);
  }
}
