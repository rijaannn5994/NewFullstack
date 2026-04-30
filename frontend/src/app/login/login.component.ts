import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[#FAFAFA] relative overflow-hidden">
      <!-- Subtle background pattern -->
      <div class="absolute inset-0 opacity-[0.03]">
        <div class="absolute inset-0" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(30, 58, 138, 0.5) 35px, rgba(30, 58, 138, 0.5) 70px)"></div>
      </div>

      <!-- Login card -->
      <div class="relative bg-white rounded-2xl shadow-xl p-10 w-full max-w-md border border-gray-100">
        <div class="flex flex-col items-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Invensystem</h1>
          <p class="text-sm text-gray-500 mt-2">Sign in to continue</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="space-y-5">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <input
                id="username"
                type="text"
                [(ngModel)]="username"
                name="username"
                class="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all text-gray-900 placeholder-gray-400"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <input
                id="password"
                type="password"
                [(ngModel)]="password"
                name="password"
                class="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all text-gray-900 placeholder-gray-400"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <div *ngIf="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {{ error }}
          </div>

          <button
            type="submit"
            [disabled]="loading"
            class="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3 px-4 rounded-xl font-medium hover:from-gray-800 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Signing In...' : 'Sign In' }}
          </button>

          <div class="mt-6 pt-6 border-t border-gray-100">
            <p class="text-xs text-gray-500 text-center">
              Demo credentials:<br>
              <span class="font-medium text-gray-700">admin/admin</span> or <span class="font-medium text-gray-700">staff/staff</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.loading = true;
    this.error = '';

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.error = err.message || 'Login failed';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
