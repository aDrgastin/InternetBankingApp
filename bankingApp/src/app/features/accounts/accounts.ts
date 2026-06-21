import { Component, inject, OnInit, signal } from '@angular/core';
import { AccountService } from '../../core/services/account-service';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { IbanPipe } from '../../shared/pipes/iban-pipe';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-accounts',
  imports: [DatePipe, CurrencyPipe, IbanPipe, RouterLink, TitleCasePipe],
  templateUrl: './accounts.html',
  styleUrl: './accounts.css',
})
export class Accounts implements OnInit {
    private readonly accountService = inject(AccountService);

    protected readonly accounts = this.accountService.accounts;
    protected errorMsg = signal('');
    protected selectedAccountId = signal<number | null>(null);

    ngOnInit(): void {
        this.accountService.loadAccounts().subscribe({
            error: (err: Error) => this.errorMsg.set(err.message)
        })
    }

    copyToClipboard(text: string): void {
        navigator.clipboard.writeText(text).then(() => {
            alert('IBAN copied to clipboard!');
        });
    }

    getStatusBadgeClass(status: string): string {
        return status === 'ACTIVE' ? 'badge-success' : 'badge-danger';
    }

    selectAccount(accountId: number): void {
        this.selectedAccountId.set(
            this.selectedAccountId() === accountId ? null : accountId
        );
    }

    getTotalBalance(): number {
        return this.accounts().reduce((sum, acc) => sum + acc.balance, 0);
    }

    getActiveAccountsCount(): number {
        return this.accounts().filter(acc => acc.status === 'ACTIVE').length;
    }
}
