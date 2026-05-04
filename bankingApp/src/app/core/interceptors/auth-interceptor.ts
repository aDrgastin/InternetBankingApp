import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authToken = localStorage.getItem('token');
    if (!authToken) return next(req);
    return next(req.clone({
        headers: req.headers.set('Authorization', `Bearer ${authToken}`)
    })).pipe(
        catchError((err: HttpErrorResponse) => {
            if (!req.url.includes('/api/auth') && err.error?.status === 'TOKEN_EXPIRED' || err.error?.status === 'INVALID_TOKEN') {
                inject(AuthService).logout();
            }
            return throwError(() => err);
        })
    );
};
