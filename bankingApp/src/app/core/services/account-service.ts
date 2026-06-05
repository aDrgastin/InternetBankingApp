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

    constructor() { // TEMPORARY UNTIL BETTER SOLUTION IS FOUND
        this.loadAccounts().subscribe();
    }

    loadAccounts() { // SHOULD RETURN NOTHING- INITIALIZATION FUNCTION???????
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

    private mapAccount(acc: Account): Account {
        return {
            ...acc,
            balance: Number(acc.balance),
            createdAt: new Date(acc.createdAt)
        };
    }
}
