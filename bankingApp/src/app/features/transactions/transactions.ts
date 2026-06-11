import { Component, computed, inject, signal } from '@angular/core';
import { TransactionService } from '../../core/services/transaction-service';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { AccountService } from '../../core/services/account-service';
import { TxDirectionPipe } from '../../shared/pipes/tx-direction-pipe';
import { TransferForm } from './transfer-form/transfer-form';

type FilterType = 'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'POS' | 'FEE';

@Component({
  selector: 'app-transactions',
  imports: [DatePipe, CurrencyPipe, TxDirectionPipe, TitleCasePipe, TransferForm],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions {
    private readonly transactionService = inject(TransactionService);
    private readonly accountService = inject(AccountService);
    
    transactions = this.transactionService.transactions;
    accounts = this.accountService.accounts;
    loading = signal(false);
    error = signal<string | null>(null);
    typeFilter = signal<FilterType>('ALL');
    accountFilter = signal<number | null>(null);
    showTransferForm = signal(false);

    filteredTransactions = computed(() => {
        const txs = this.transactions();
        const typeFilterValue = this.typeFilter();
        const accountFilterValue = this.accountFilter();
        let filtered = txs;
        
        if (typeFilterValue !== 'ALL') {
            filtered = filtered.filter(t => t.type === typeFilterValue);
        }
        if (accountFilterValue !== null) {
            filtered = filtered.filter(t => 
                t.fromAccountId === accountFilterValue || t.toAccountId === accountFilterValue
            );
        }
        return filtered;
    });

    onAccountFilterChange(event: Event) {
        const value = +(event.target as HTMLSelectElement).value;
        this.accountFilter.set(!value ? null : +value);
    }

    setTypeFilter(filterType: FilterType): void {
        this.typeFilter.set(filterType);
    }

    getTransactionIconClass(type: string): string {
        if (type === 'WITHDRAWAL') return 'fa-turn-down';
        else if (type === 'DEPOSIT') return 'fa-turn-up';
        else if (type === 'POS') return 'fa-cash-register';
        else if (type === 'FEE') return 'fa-file-invoice-dollar';
        else return 'fa-arrow-right-arrow-left';
    }

    onTransferSuccess() {
        this.showTransferForm.set(false);
        this.transactionService.refetch().subscribe();
        this.accountService.refetch().subscribe();
    }
}
