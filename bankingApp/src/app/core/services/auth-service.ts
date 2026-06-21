import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, EMPTY, forkJoin, map, switchMap, tap, throwError } from 'rxjs';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';
import { AccountService } from './account-service';
import { Router } from '@angular/router';
import { TransactionService } from './transaction-service';
import { CardService } from './card-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
    private readonly API_ENDPOINT = `${environment.API_URL}/api/auth`;
    private readonly http = inject(HttpClient);
    private readonly accountService = inject(AccountService);
    private readonly transactionService = inject(TransactionService);
    private readonly cardService = inject(CardService);
    private readonly router = inject(Router);

    private readonly currentUser = signal<User | null>(null);
    readonly user = this.currentUser.asReadonly();
    readonly isAuthenticated = computed(() => this.currentUser() !== null);
    readonly isPrivileged = computed(() => ['ADMIN', 'MOD'].includes(this.currentUser()?.role ?? ''));

    login(username: string, password: string) {
        return this.http.post<AuthResponse>(`${this.API_ENDPOINT}/login`, { username, password }).pipe(
            map(res => {
                if (!res.user) throw new Error('INVALID_RESPONSE');
                return {
                    token: res.token,
                    user: this.mapUser(res.user)
                };
            }),
            tap(res => {
                localStorage.setItem('token', res.token);
                this.currentUser.set(res.user);
            }),
            switchMap(() => forkJoin([
                this.accountService.loadAccounts(),
                this.transactionService.loadTransactions(),
                this.cardService.loadCards()
            ])),
            catchError((err: HttpErrorResponse) => {
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
        this.accountService.clearAccounts();
        this.transactionService.clearTransactions();
        this.cardService.clearCards();
        this.router.navigate(['/login']);
    }

    getToken() {
        return localStorage.getItem('token');
    }

    autoLogin() {
        if (!this.getToken()) return EMPTY;
        return this.http.get<{ user: User }>(`${this.API_ENDPOINT}/me`).pipe(
            map(res => {
                if (!res) throw new Error('INVALID_RESPONSE');
                return this.mapUser(res.user);
            }),
            tap((user: User) => {
                this.currentUser.set(user);
                console.log('Auto-logged in as', user.username);
            }),
            switchMap(() => forkJoin([
                this.accountService.loadAccounts(),
                this.transactionService.loadTransactions(),
                this.cardService.loadCards()
            ])),
            catchError((err: HttpErrorResponse) => {
                const status = err.error?.status;
                if (status === 'NO_TOKEN') {
                    console.error('No token:', err);
                } else if (status === 'TOKEN_EXPIRED') {
                    console.error('Token expired:', err);
                } else if (status === 'INVALID_TOKEN') {
                    console.error('Invalid token:', err);
                } else if (status === 'USER_NOT_FOUND') {
                    console.error('User not found:', err);
                }
                localStorage.removeItem('token');
                this.router.navigate(['/login']);
                return EMPTY;
            })
        );
    }

    register(pin: string, username: string, password: string, firstName: string, lastName: string, email: string) {
        return this.http.post<AuthResponse>(`${this.API_ENDPOINT}/register`, { pin, username, password, firstName, lastName, email }).pipe(
            map(res => {
                if (!res.user) throw new Error('INVALID_RESPONSE');
                return {
                    token: res.token,
                    user: this.mapUser(res.user)
                };
            }),
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

    updateUser(updatedUser: User) {
        return this.http.put<{ user: User }>(`${this.API_ENDPOINT}/${updatedUser.id}`, { pin: updatedUser.pin, username: updatedUser.username, firstName: updatedUser.firstName, lastName: updatedUser.lastName, email: updatedUser.email }).pipe(
            map(res => {
                if (!res.user) throw new Error('INVALID_RESPONSE');
                return this.mapUser(res.user);
            }),
            tap(user => {
                if (user.id === this.currentUser()?.id) {
                    this.currentUser.set(user);
                }
            }),
            catchError((err: HttpErrorResponse) => {
                const status = err.error?.status;
                let message = 'An unexpected error occured';
                if (status === 'USER_NOT_FOUND') {
                    console.error('User not found:', err);
                    message = 'User not found';
                } else if (status === 'MISSING_DATA') {
                    console.error('Missing data:', err);
                    message = 'Please fill in all fields';
                } else if (status === 'PIN_EXISTS') {
                    console.error('Pin exists:', err);
                    message = 'Pin is already used';
                }
                return throwError(() => new Error(message, { cause: err }));
            })
        );
    }

    changePassword(userId: number, currentPassword: string, newPassword: string) {
        return this.http.patch<{ status: string }>(`${this.API_ENDPOINT}/${userId}/password`, { currentPassword, newPassword }).pipe(
            catchError((err: HttpErrorResponse) => {
                const status = err.error?.status;
                let message = 'Failed to change password';
                if (status === 'INVALID_ID') message = 'Invalid id';
                else if (status === 'MISSING_DATA') message = 'Please fill in all fields';
                else if (status === 'USER_NOT_FOUND') message = 'User not found';
                else if (status === 'WRONG_PASSWORD') message = 'Wrong password';
                return throwError(() => new Error(message, { cause: err }));
            })
        );
    }

    getAllUsers() {
        return this.http.get<{ status: string, users: any[] }>(`${this.API_ENDPOINT}/users`).pipe(
            map(res => {
                if (!Array.isArray(res.users)) throw new Error('INVALID_RESPONSE');
                return res.users.map(u => this.mapUser(u));
            }),
            catchError(err => {
                const status = err.error?.status;
                let message = 'An unexpected error occured';
                if (status === 'INVALID_RESPONSE') {
                    console.error('Unexpected API response:', err);
                    message = 'Unexpected response';
                }
                return throwError(() => new Error(message, { cause: err }));
            })
        );
    }

    private mapUser(user: User): User {
        return {
            ...user,
            createdAt: new Date(user.createdAt)
        };
    }
}
