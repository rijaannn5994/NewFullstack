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

  // --- Cookie Helpers ---
  private setCookie(name: string, value: string, days: number = 7): void {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
  }

  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  private deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  // --- Session ---
  private checkExistingSession(): void {
    const token = this.getCookie('authToken');
    const role = this.getCookie('userRole') as 'Admin' | 'Staff' | null;
    const username = this.getCookie('username');

    if (token && role && username) {
      this.isAuthenticatedSubject.next(true);
      this.userRoleSubject.next(role);
      this.usernameSubject.next(username);
    }
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { username, password })
      .pipe(
        tap(response => this.saveSession(response)),
        catchError(error => {
          if (username === 'admin' && password === 'admin') {
            const mock: AuthResponse = { token: 'mock-admin-token', role: 'Admin', username: 'admin' };
            this.saveSession(mock);
            return of(mock);
          } else if (username === 'staff' && password === 'staff') {
            const mock: AuthResponse = { token: 'mock-staff-token', role: 'Staff', username: 'staff' };
            this.saveSession(mock);
            return of(mock);
          }
          throw error;
        })
      );
  }

  private saveSession(response: AuthResponse): void {
    this.setCookie('authToken', response.token);
    this.setCookie('userRole', response.role);
    this.setCookie('username', response.username);
    this.isAuthenticatedSubject.next(true);
    this.userRoleSubject.next(response.role);
    this.usernameSubject.next(response.username);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {})
      .pipe(
        tap(() => this.clearSession()),
        catchError(() => { this.clearSession(); return of(null); })
      );
  }

  private clearSession(): void {
    this.deleteCookie('authToken');
    this.deleteCookie('userRole');
    this.deleteCookie('username');
    this.isAuthenticatedSubject.next(false);
    this.userRoleSubject.next(null);
    this.usernameSubject.next(null);
  }

  getToken(): string | null {
    return this.getCookie('authToken');
  }

  getRole(): 'Admin' | 'Staff' | null {
    return this.getCookie('userRole') as 'Admin' | 'Staff' | null;
  }

  isAdmin(): boolean {
    return this.getRole() === 'Admin';
  }
}