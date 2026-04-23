import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface AuthResponse {
  token: string;
  role: 'Admin' | 'Staff';
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private userRoleSubject = new BehaviorSubject<'Admin' | 'Staff' | null>(null);
  private usernameSubject = new BehaviorSubject<string | null>(null);

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public userRole$ = this.userRoleSubject.asObservable();
  public username$ = this.usernameSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkExistingSession();
  }

  private checkExistingSession(): void {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole') as 'Admin' | 'Staff' | null;
    const username = localStorage.getItem('username');

    if (token && role && username) {
      this.isAuthenticatedSubject.next(true);
      this.userRoleSubject.next(role);
      this.usernameSubject.next(username);
    }
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { username, password })
      .pipe(
        tap(response => {
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('userRole', response.role);
          localStorage.setItem('username', response.username);
          this.isAuthenticatedSubject.next(true);
          this.userRoleSubject.next(response.role);
          this.usernameSubject.next(response.username);
        }),
        catchError(error => {
          // Fallback mock authentication
          if (username === 'admin' && password === 'admin') {
            const mockResponse: AuthResponse = {
              token: 'mock-admin-token',
              role: 'Admin',
              username: 'admin'
            };
            localStorage.setItem('authToken', mockResponse.token);
            localStorage.setItem('userRole', mockResponse.role);
            localStorage.setItem('username', mockResponse.username);
            this.isAuthenticatedSubject.next(true);
            this.userRoleSubject.next(mockResponse.role);
            this.usernameSubject.next(mockResponse.username);
            return of(mockResponse);
          } else if (username === 'staff' && password === 'staff') {
            const mockResponse: AuthResponse = {
              token: 'mock-staff-token',
              role: 'Staff',
              username: 'staff'
            };
            localStorage.setItem('authToken', mockResponse.token);
            localStorage.setItem('userRole', mockResponse.role);
            localStorage.setItem('username', mockResponse.username);
            this.isAuthenticatedSubject.next(true);
            this.userRoleSubject.next(mockResponse.role);
            this.usernameSubject.next(mockResponse.username);
            return of(mockResponse);
          }
          throw error;
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {})
      .pipe(
        tap(() => this.clearSession()),
        catchError(() => {
          this.clearSession();
          return of(null);
        })
      );
  }

  private clearSession(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    this.isAuthenticatedSubject.next(false);
    this.userRoleSubject.next(null);
    this.usernameSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getRole(): 'Admin' | 'Staff' | null {
    return localStorage.getItem('userRole') as 'Admin' | 'Staff' | null;
  }

  isAdmin(): boolean {
    return this.getRole() === 'Admin';
  }
}
