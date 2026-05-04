import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, EMPTY, tap, throwError } from 'rxjs';
import { User } from '../models/user';
import { AuthResponse } from '../models/authResponse';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
    private readonly API_ENDPOINT = `${environment.API_URL}/api/auth`;
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);

    private readonly currentUser = signal<User | null>(null);
    readonly user = this.currentUser.asReadonly();
    readonly isAuthenticated = computed(() => this.currentUser() !== null);

    login(username: string, password: string) {
        return this.http.post<AuthResponse>(`${this.API_ENDPOINT}/login`, { username, password }).pipe(
            tap(res => {
                localStorage.setItem('token', res.token);
                this.currentUser.set(res.user);
            }), catchError((err: HttpErrorResponse) => {
                const status = err.error?.status;
                let message = 'An unexpected error occured';
                if (status === 'USER_NOT_FOUND' || status === 'WRONG_PASSWORD') {
                    console.error('Invalid username or password:', err);
                    message = 'Invalid username or password';
                } else if (status === 'MISSING_CREDENTIALS') {
                    console.error('Missing credentials:', err);
                    message = 'Please fill in all fields';
                }
                return throwError(() => new Error(message, { cause: err }));
            })
        );
    }

    logout() {
        localStorage.removeItem('token');
        this.currentUser.set(null);
        this.router.navigate(['/login']);
    }

    getToken() {
        return localStorage.getItem('token');
    }

    autoLogin() {
        if (!this.getToken()) return EMPTY;
        return this.http.get<{ user: User }>(`${this.API_ENDPOINT}/me`).pipe(
            tap(res => {
                this.currentUser.set(res.user);
                console.log('Auto-logged in as', res.user.username);
            }), catchError((err: HttpErrorResponse) => {
                const status = err.error?.status;
                if (status === 'NO_TOKEN') {
                    console.error('No token:', err);
                } else if (status === 'TOKEN_EXPIRED') {
                    console.error('Token expired:', err);
                } else if (status === 'INVALID_TOKEN') {
                    console.error('Invalid token:', err);
                }
                localStorage.removeItem('token');
                this.router.navigate(['/login']);
                return EMPTY;
            })
        );
    }

    register(pin: string, username: string, password: string, firstName: string, lastName: string, email: string) {
        return this.http.post<AuthResponse>(`${this.API_ENDPOINT}/register`, { pin, username, password, firstName, lastName, email }).pipe(
            tap(res => {
                localStorage.setItem('token', res.token);
                this.currentUser.set(res.user);
            }), catchError((err: HttpErrorResponse) => {
                const status = err.error?.status;
                let message = 'An unexpected error occured';
                if (status === 'USER_EXISTS') {
                    console.error('User already exists:', err);
                    message = 'User already exists';
                } else if (status === 'MISSING_CREDENTIALS') {
                    console.error('Missing credentials:', err);
                    message = 'Please fill in all fields';
                }
                return throwError(() => new Error(message, { cause: err }));
            })
        );
    }
}
