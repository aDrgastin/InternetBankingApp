import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Account } from '../../features/accounts/account';
import { catchError, EMPTY, map, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
    private readonly API_ENDPOINT = `${environment.API_URL}/api/accounts`;
    private readonly http = inject(HttpClient);

    private readonly accountsSignal = signal<Account[]>([]);
    readonly accounts = this.accountsSignal.asReadonly();
    private loaded = false;

    loadAccounts() {
        if (this.loaded) return EMPTY;
        return this.http.get<{ status: string, accounts: any[] }>(`${this.API_ENDPOINT}/my`).pipe(
            map(res => {
                if (!Array.isArray(res?.accounts)) throw new Error('INVALID_RESPONSE');
                return res.accounts.map(acc => this.mapAccount(acc));
            }),
            tap(accounts => {
                this.accountsSignal.set(accounts);
                this.loaded = true;
            }),
            catchError((err: HttpErrorResponse) => {
                const status = err.error?.status;
                let message = 'Failed to load accounts';
                if (status === 'UNAUTHORIZED') message = 'Session expired';
                return throwError(() => new Error(message, { cause: err }));
            })
        );
    }

    clearAccounts() {
        this.accountsSignal.set([]);
        this.loaded = false;
    }

    refetch() {
        this.loaded = false;
        return this.loadAccounts();
    }

    createAccount(userId: number, type: string) {
        return this.http.post<{ status: string, account: Account }>(this.API_ENDPOINT, { userId, type }).pipe(
            map(res => {
                return this.mapAccount(res.account);
            }),
            catchError((err: HttpErrorResponse) => {
                const status = err.error?.status;
                let message = 'Failed to load accounts';
                if (status === 'UNAUTHORIZED') message = 'Session expired';
                else if (status === 'MISSING_ID' || status === 'MISSING_TYPE') message = 'Missing data';
                else if (status === 'UNKNOWN_ENUM') message = 'Invalid account type';
                else if (status === 'ACCOUNT_EXISTS') message = 'Account already exists';
                return throwError(() => new Error(message, { cause: err }));
            })
        );
    }

    updateAccountStatus(accountId: number, status: 'ACTIVE' | 'CLOSED') {
        return this.http.patch<{ status: string }>(`${this.API_ENDPOINT}/${accountId}/status`, { status }).pipe(
            catchError((err: HttpErrorResponse) => {
                const status = err.error?.status;
                let message = 'Failed to update account status';
                if (status === 'UNAUTHORIZED') message = 'Session expired';
                else if (status === 'INVALID_ID') message = 'Invalid id';
                else if (status === 'MISSING_STATUS') message = 'Missing status';
                else if (status === 'UNKNOWN_STATUS') message = 'Unknown status';
                return throwError(() => new Error(message, { cause: err }));
            })
        );
    }

    getAccountsByUserId(userId: number) {
        return this.http.get<{ status: string, accounts: any[] }>(`${this.API_ENDPOINT}/user/${userId}`).pipe(
            map(res => {
                if (!Array.isArray(res.accounts)) throw new Error('INVALID_RESPONSE');
                return res.accounts.map(a => this.mapAccount(a));
            }),
            catchError((err: HttpErrorResponse) => {
                const status = err.error?.status;
                let message = 'Failed to load accounts';
                if (status === 'UNAUTHORIZED') message = 'Session expired';
                else if (status === 'INVALID_ID') message = 'Invalid id';
                return throwError(() => new Error(message, { cause: err }));
            })
        );
    }

    private mapAccount(acc: Account): Account {
        return {
            ...acc,
            balance: Number(acc.balance),
            createdAt: new Date(acc.createdAt)
        };
    }
}
