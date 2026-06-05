import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Transaction } from '../../features/transactions/transaction';
import { catchError, EMPTY, map, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
    private readonly API_ENDPOINT = `${environment.API_URL}/api/transactions`;
    private readonly http = inject(HttpClient);

    private readonly transactionsSignal = signal<Transaction[]>([]);
    readonly transactions = this.transactionsSignal.asReadonly();
    private loaded = false;

    constructor() { // TEMPORARY UNTIL BETTER SOLUTION IS FOUND
        this.loadTransactions().subscribe();
    }

    loadTransactions() {
        if (this.loaded) return EMPTY;
        return this.http.get<{ status: string, transactions: any[] }>(`${this.API_ENDPOINT}/my`).pipe(
            map(res => {
                if (!Array.isArray(res?.transactions)) throw new Error('INVALID_RESPONSE');
                return res.transactions.map(t => this.mapTransaction(t));
            }),
            tap(transactions => {
                this.transactionsSignal.set(transactions);
                this.loaded = true;
            }),
            catchError((err: HttpErrorResponse) => {
                const status = err.error?.status;
                let message = 'Failed to load transactions';
                if (status === 'UNAUTHORIZED') message = 'Session expired';
                return throwError(() => new Error(message, { cause: err }));
            })
        );
    }

    clearTransactions() {
        this.transactionsSignal.set([]);
        this.loaded = false;
    }

    private mapTransaction(t: Transaction): Transaction {
        return {
            ...t,
            amount: Number(t.amount),
            timestamp: new Date(t.timestamp)
        };
    }
}
