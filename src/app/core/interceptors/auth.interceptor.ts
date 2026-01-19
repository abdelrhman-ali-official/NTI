import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only logout on 401 for authentication endpoints, not for permission/authorization errors
      if (error.status === 401 && token) {
        const isPublicEndpoint = req.url.includes('/register') || 
                                req.url.includes('/status') || 
                                req.url.includes('/login');
        
        const isAuthEndpoint = req.url.includes('/auth/');
        
        // Only logout if it's an auth endpoint and not public, or if error specifically says token is invalid
        if (!isPublicEndpoint && (isAuthEndpoint || error.error?.message?.toLowerCase().includes('token'))) {
          authService.logout();
        }
      }
      return throwError(() => error);
    })
  );
};
