import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, EMPTY, tap, throwError } from 'rxjs';
import { User } from '../models/user.model';
import { AuthResponse } from '../models/authResponse.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
    private readonly API_ENDPOINT = `${environment.API_URL}/api/auth`;
    private readonly http = inject(HttpClient);

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
                    console.error('Invalid API response:', err);
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
        // redirect if inside protected route
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
                let message = 'An unexpected error occurred';
                if (status === 'NO_TOKEN') {
                    console.error('No token:', err);
                    message = 'Auto-login failed';
                } else if (status === 'INVALID_TOKEN') {
                    console.error('Invalid token:', err);
                    message = 'Auto-login failed';
                }
                localStorage.removeItem('token');
                return throwError(() => new Error(message, { cause: err }));
                //return EMPTY;
            })
        );
    }

    register(username: string, password: string, name: string, email: string) {
        return this.http.post<AuthResponse>(`${this.API_ENDPOINT}/register`, { username, password, name, email }).pipe(
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
