import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth-service';
import { AccountService } from '../../core/services/account-service';
import { RouterLink } from "@angular/router";
import { TransactionService } from '../../core/services/transaction-service';
import { CardService } from '../../core/services/card-service';
import { TxDirectionPipe } from '../../shared/pipes/tx-direction-pipe';
import { IbanPipe } from '../../shared/pipes/iban-pipe';
import { MaskCardNoPipe } from '../../shared/pipes/mask-card-no-pipe';

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, DatePipe, RouterLink, TxDirectionPipe, IbanPipe, MaskCardNoPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
    private readonly authService = inject(AuthService);
    private readonly accountService = inject(AccountService);
    private readonly transactionService = inject(TransactionService);
    private readonly cardService = inject(CardService);

    protected readonly NOW = new Date;
    protected user = this.authService.user;
    protected accounts = this.accountService.accounts;
    protected transactions = this.transactionService.transactions;
    protected cards = this.cardService.cards;
    protected totalBalance = computed(() => {
        return this.accounts().reduce((sum, acc) => sum + acc.balance, 0);
    });
    protected recentTransactions = computed(() => {
        return this.transactions().slice(0, 5);
    });
    protected activeCards = computed(() => {
        return this.cards().filter(card => card.status === 'ACTIVE');
    });

    getStatusBadgeClass(status: string): string {
        const statusMap: { [key: string]: string } = {
            'ACTIVE': 'badge-success',
            'COMPLETED': 'badge-success',
            'PENDING': 'badge-warning',
            'FAILED': 'badge-danger',
            'BLOCKED': 'badge-danger',
            'EXPIRED': 'badge-secondary',
            'CLOSED': 'badge-secondary'
        };
        return statusMap[status] || 'badge-secondary';
    }
}
