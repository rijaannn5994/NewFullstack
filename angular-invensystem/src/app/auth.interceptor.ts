import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  const role = authService.getRole();

  let authReq = req;

  // Add Authorization and X-Role headers for Flask backend
  if (token && role) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'X-Role': role
      }
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      // Handle 401 Unauthorized
      if (error.status === 401) {
        authService.logout().subscribe(() => {
          router.navigate(['/login']);
        });
      }
      // Handle 403 Forbidden (from @require_admin decorator)
      if (error.status === 403) {
        console.error('Forbidden: Admin access required');
      }
      return throwError(() => error);
    })
  );
};
