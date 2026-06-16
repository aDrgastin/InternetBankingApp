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

    refetch() {
        this.loaded = false;
        return this.loadTransactions();
    }

    getTransactionsByAccId(accId: number) {
        return this.http.get<{ status: string, transactions: any[] }>(`${this.API_ENDPOINT}/account/${accId}`).pipe(
            map(res => {
                if (!Array.isArray(res.transactions)) throw new Error('INVALID_RESPONSE');
                return res.transactions.map(t => this.mapTransaction(t));
            }),
            catchError((err: HttpErrorResponse) => {
                const status = err.error?.status;
                let message = 'Failed to fetch transactions';
                if (status === 'INVALID_ID') message = 'Invalid id';
                else if (status === 'ACCOUNT_NOT_FOUND') message = 'Account doesnt exist';
                return throwError(() => new Error(message, { cause: err }));
            })
        );
    }

    transferFunds(fromAccId: number, toIban: string, amount: number, description: string | null) {
        return this.http.post<{ status: string }>(`${this.API_ENDPOINT}/transfer`, { fromAccId, toIban, amount, description }).pipe(
            catchError((err: HttpErrorResponse) => {
                const status = err.error?.status;
                let message = 'Failed to transfer funds';
                if (status === 'MISSING_DATA') message = 'Missing data';
                else if (status === 'ACCOUNT_NOT_FOUND') message = 'Account not found';
                else if (status === 'FORBIDDEN') message = 'Forbidden operation';
                else if (status === 'SOURCE_ACCOUNT_CLOSED') message = 'Source account is closed';
                else if (status === 'DESTINATION_ACCOUNT_CLOSED') message = 'Destination account is closed';
                else if (status === 'INSUFFICIENT_FUNDS') message = 'Insufficient funds';
                return throwError(() => new Error(message, { cause: err }));
            })
        );
    }

    posPayout(fromAccId: number, toIban: string, amount: number, description: string | null) {
        return this.http.post<{ status: string }>(`${this.API_ENDPOINT}/pos`, { fromAccId, toIban, amount, description }).pipe(
            catchError((err: HttpErrorResponse) => {
                const status = err.error?.status;
                let message = 'Failed to do a POS payout';
                if (status === 'MISSING_DATA') message = 'Missing data';
                else if (status === 'ACCOUNT_NOT_FOUND') message = 'Account not found';
                else if (status === 'FORBIDDEN') message = 'Forbidden operation';
                else if (status === 'SOURCE_ACCOUNT_CLOSED') message = 'Source account is closed';
                else if (status === 'DESTINATION_ACCOUNT_CLOSED') message = 'Destination account is closed';
                else if (status === 'INSUFFICIENT_FUNDS') message = 'Insufficient funds';
                return throwError(() => new Error(message, { cause: err }));
            })
        );
    }

    withdraw(accId: number, amount: number, description: string | null) {
        return this.http.post<{ status: string }>(`${this.API_ENDPOINT}/withdraw/${accId}`, { amount, description }).pipe(
            catchError((err: HttpErrorResponse) => {
                const status = err.error?.status;
                let message = 'Failed to withdraw funds';
                if (status === 'INVALID_ID') message = 'Invalid account id';
                else if (status === 'MISSING_DATA') message = 'Missing data';
                else if (status === 'ACCOUNT_NOT_FOUND') message = 'Account not found';
                else if (status === 'FORBIDDEN') message = 'Forbidden operation';
                else if (status === 'ACCOUNT_CLOSED') message = 'Account is closed';
                else if (status === 'INSUFFICIENT_FUNDS') message = 'Insufficient funds';
                return throwError(() => new Error(message, { cause: err }));
            })
        );
    }

    deposit(accId: number, amount: number, description: string | null) {
        return this.http.post<{ status: string }>(`${this.API_ENDPOINT}/deposit/${accId}`, { amount, description }).pipe(
            catchError((err: HttpErrorResponse) => {
                const status = err.error?.status;
                let message = 'Failed to deposit funds';
                if (status === 'INVALID_ID') message = 'Invalid account id';
                else if (status === 'MISSING_DATA') message = 'Missing data';
                else if (status === 'ACCOUNT_NOT_FOUND') message = 'Account not found';
                else if (status === 'FORBIDDEN') message = 'Forbidden operation';
                else if (status === 'ACCOUNT_CLOSED') message = 'Account is closed';
                return throwError(() => new Error(message, { cause: err }));
            })
        );
    }

    private mapTransaction(t: Transaction): Transaction {
        return {
            ...t,
            amount: Number(t.amount),
            timestamp: new Date(t.timestamp)
        };
    }
}
