import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth-service';
import { AccountService } from '../../core/services/account-service';
import { TransactionService } from '../../core/services/transaction-service';
import { CardService } from '../../core/services/card-service';
import { User } from '../../core/models/user';
import { Account } from '../accounts/account';
import { Transaction } from '../transactions/transaction';
import { Card } from '../cards/card';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { IbanPipe } from '../../shared/pipes/iban-pipe';
import { CardNoPipe } from '../../shared/pipes/card-no-pipe';
import { TxDirectionPipe } from '../../shared/pipes/tx-direction-pipe';
import { HttpClient } from '@angular/common/http';
import AuditEntry from './audit-entry';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import PagedResponse from '../../core/models/paged-response';

@Component({
  selector: 'app-admin-panel',
  imports: [ReactiveFormsModule, DatePipe, CurrencyPipe, TitleCasePipe, IbanPipe, CardNoPipe, TxDirectionPipe, FormsModule],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css',
})
export class AdminPanel implements OnInit {
    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);
    private readonly accountService = inject(AccountService);
    private readonly txService = inject(TransactionService);
    private readonly cardService = inject(CardService);

    protected activeTab = signal<'USERS' | 'TRANSACTIONS' | 'CARDS' | 'AUDIT'>('USERS'); 

    protected currentUser = this.authService.user;

    protected users = signal<User[]>([]);
    protected usersLoading = signal(false);
    protected usersError = signal<string | null>(null);
    private usersLoaded = false;
    protected expandedUserId = signal<number | null>(null);
    protected userAccounts = signal<Record<number, Account[]>>({});

    protected txAccId = signal<number | null>(null);
    protected transactions = signal<Transaction[]>([]);
    protected txLoading = signal(false);
    protected txError = signal<string | null>(null);

    protected cardSearchId = signal<number | null>(null);
    protected cards = signal<Card[]>([]);
    protected cardsLoading = signal(false);
    protected cardsError = signal<string | null>(null);
    protected selectedCard = signal<number | null>(null);

    protected userSearch = signal('');
    protected accStatusFilter = signal<'ALL' | 'ACTIVE' | 'CLOSED'>('ALL');
    protected showCreateAccForUser = signal<number | null>(null);
    protected expandLoading = signal(false);

    protected depositLoading = signal(false);
    protected depositError = signal<string | null>(null);
    protected depositSuccess = signal<string | null>(null);
    protected withdrawLoading = signal(false);
    protected withdrawError = signal<string | null>(null);
    protected withdrawSuccess = signal<string | null>(null);
    protected posLoading = signal(false);
    protected posError = signal<string | null>(null);
    protected posSuccess = signal<string | null>(null);
    protected transferLoading = signal(false);
    protected transferError = signal<string | null>(null);
    protected transferSuccess = signal<string | null>(null);

    protected auditLogs = signal<AuditEntry[]>([]);
    protected auditLoading = signal(false);
    protected auditError = signal<string | null>(null);
    protected auditPage = signal(1);
    protected auditTotalPages = signal(1);
    protected readonly AUDIT_LIMITS = [10, 20, 50, 100];
    protected auditLimit = signal(10);
    protected expandedDiffId = signal<number | null>(null);

    protected filteredUsers = computed(() => {
        const q = this.userSearch().toLowerCase().trim();
        if (!q) return this.users();
        return this.users().filter(u =>
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
        );
    });

    protected createAccForm = new FormGroup({
        type: new FormControl<'CHECKING' | 'SAVINGS'>('CHECKING', { nonNullable: true }),
    });
    protected depositForm = new FormGroup({
        accountId:   new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(1)] }),
        amount:      new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(0.01)] }),
        description: new FormControl(''),
    });
    protected withdrawForm = new FormGroup({
        accountId:   new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(1)] }),
        amount:      new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(0.01)] }),
        description: new FormControl(''),
    });
    protected posForm = new FormGroup({
        fromAccountId: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(1)] }),
        toIban: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^HR\d{19}$/)] }),
        amount:        new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(0.01)] }),
        description:   new FormControl(''),
    });
    protected transferFormGroup = new FormGroup({
        fromAccountId: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(1)] }),
        toIban:        new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^HR\d{19}$/)] }),
        amount:        new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(0.01)] }),
        description:   new FormControl(''),
    });

    ngOnInit(): void {
        this.loadUsers();
    }

    protected onTabChange(tab: 'USERS' | 'TRANSACTIONS' | 'CARDS' | 'AUDIT') {
        this.activeTab.set(tab);
        if (tab === 'USERS') this.loadUsers();
        else if (tab === 'AUDIT') this.loadAuditLog(1);
    }

    loadUsers() {
        if (this.usersLoaded) return;
        this.usersError.set(null);
        this.usersLoading.set(true);
        this.authService.getAllUsers().subscribe({
            next: (users) => {
                this.users.set(users);
                this.usersLoaded = true;
                this.usersLoading.set(false);
            },
            error: (err: Error) => {
                console.error('Error while fetching all users:', err.cause);
                this.usersError.set(err.message);
                this.usersLoading.set(false);
            }
        });
    }

    loadTransactions() {
        const accId = this.txAccId();
        if (!accId) return;
        this.txError.set(null);
        this.txLoading.set(true);
        this.txService.getTransactionsByAccId(accId).subscribe({
            next: txs => {
                this.transactions.set(txs);
                this.txLoading.set(false);
            },
            error: (err: Error) => {
                console.error('Error while fetching transactions for a selected account:', err.cause);
                this.txError.set(err.message);
                this.txLoading.set(false);
            }
        });
    }

    loadCards() {
        const cardId = this.cardSearchId();
        if (!cardId) return;
        this.cardsError.set(null);
        this.cardsLoading.set(true);
        this.cardService.getCardById(cardId).subscribe({
            next: card => {
                this.cards.set([card]);
                this.cardsLoading.set(false);
            },
            error: (err: Error) => {
                console.error('Error while fetching card:', err.cause);
                this.cardsError.set(err.message);
                this.cardsLoading.set(false);
            }
        });
    }

    protected loadCardsByUserId(): void {
        const userId = this.cardSearchId();
        if (!userId) return;
        this.cardsError.set(null);
        this.cardsLoading.set(true);
        this.cardService.getCardsByUserId(userId).subscribe({
            next: cards => {
                this.cards.set(cards);
                this.cardsLoading.set(false);
            },
            error: (err: Error) => {
                console.error('Error while loading user cards:', err.cause);
                this.cardsError.set(err.message);
                this.cardsLoading.set(false);
            },
        });
    }

    protected loadAuditLog(page = 1) {
        this.auditLoading.set(true);
        this.auditError.set(null);
        this.http.get<PagedResponse>(`${environment.API_URL}/api/audit?page=${page}&limit=${this.auditLimit()}`).pipe(
            map(res => {
                if (!Array.isArray(res.data)) throw new Error('INVALID_RESPONSE');
                return {
                    data: res.data.map(ae => ({
                        ...ae,
                        changedAt: new Date(ae.changedAt),
                        oldData: ae.oldData ? JSON.stringify(ae.oldData, null, 2) : null,
                        newData : ae.newData ? JSON.stringify(ae.newData, null, 2) : null
                    })),
                    pagination: { page: res.pagination.page, totalPages: res.pagination.totalPages }
                }
            })
        ).subscribe({
            next: res => {
                this.auditLogs.set(res.data);
                this.auditPage.set(res.pagination.page);
                this.auditTotalPages.set(res.pagination.totalPages);
                this.auditLoading.set(false);
            },
            error: (err: Error) => {
                console.error('Error while fetching audit logs:', err);
                this.auditError.set(err.message);
                this.auditLoading.set(false);
            }
        });
    }

    protected onAuditLimitChange(limit: number) {
        this.auditLimit.set(limit);
        this.loadAuditLog(1);
    }

    protected toggleDiff(id: number): void {
        this.expandedDiffId.set(this.expandedDiffId() === id ? null : id);
    }

    protected toggleExpandUser(userId: number): void {
        const next = this.expandedUserId() === userId ? null : userId;
        this.expandedUserId.set(next);
        this.showCreateAccForUser.set(null);
        if (next !== null && !this.userAccounts()[userId]) {
            this.expandLoading.set(true);
            this.accountService.getAccountsByUserId(userId).subscribe({
                next: accounts => {
                    this.expandLoading.set(false);
                    this.userAccounts.update(r => ({ ...r, [userId]: accounts }));
                },
                error: (err: Error) => {
                    this.expandLoading.set(false);
                    console.error(err);
                },
            });
        }
    }

    protected getAccountsForUser(userId: number): Account[] {
        return this.userAccounts()[userId] ?? [];
    }

    protected submitCreateAccount(userId: number): void {
        if (this.createAccForm.invalid) return;
        const { type } = this.createAccForm.getRawValue();
        this.accountService.createAccount(userId, type).subscribe({
            next: (acc) => {
                this.showCreateAccForUser.set(null);
                this.createAccForm.reset({ type: 'CHECKING' });
                this.userAccounts.update(current => ({
                        ...current,
                        [userId]: [...current[userId] || [], acc]
                    })
                );
            },
            error: (err: Error) => console.error(err.cause),
        });
    }

    protected toggleAccountStatus(userId: number, accountId: number, status: 'ACTIVE' | 'CLOSED'): void {
        this.accountService.updateAccountStatus(accountId, status).subscribe({
            next: () => {
                this.userAccounts.update(rec => ({
                    ...rec,
                    [userId]: rec[userId]?.map(a => a.id === accountId ? { ...a, status: status }: a) ?? []
                }));
            },
            error: (err: Error) => {
                console.error('Error while updating account status:', err.cause);
            }
        });
    }

    protected toggleCardStatus(cardId: number, currentStatus: string): void {
        const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
        this.cardService.updateCardStatus(cardId, newStatus).subscribe({
            next: updated => this.cards.update(cs => cs.map(c => c.id === cardId ? updated : c)),
            error: (err: Error) => console.error(err.cause),
        });
    }

    protected getTxIconClass(type: string): string {
        if (type === 'WITHDRAWAL') return 'fa-turn-down';
        if (type === 'DEPOSIT')    return 'fa-turn-up';
        if (type === 'POS')        return 'fa-cash-register';
        if (type === 'FEE')        return 'fa-file-invoice-dollar';
        return 'fa-arrow-right-arrow-left';
    }

    protected formatExpiry(date: Date): string {
        const d = new Date(date);
        return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`;
    }

    onSubmitTransfer() {
        if (this.transferFormGroup.invalid) return;
        this.transferSuccess.set(null);
        this.transferError.set(null);
        this.transferLoading.set(true);
        const { fromAccountId, toIban, amount, description } = this.transferFormGroup.getRawValue();
        this.txService.transferFunds(fromAccountId!, toIban, amount, description).subscribe({
            next: () => {
                this.transferLoading.set(false);
                this.transferSuccess.set('Transfer completed.');
                this.transferFormGroup.reset();
            },
            error: (err: Error) => {
                console.error('Error during transfer:', err.cause);
                this.transferError.set(err.message);
                this.transferLoading.set(false);
            },
        });
    }

    onSubmitPOS() {
        if (this.posForm.invalid) return;
        this.posSuccess.set(null);
        this.posError.set(null);
        this.posLoading.set(true);
        const { fromAccountId, toIban, amount, description } = this.posForm.getRawValue();
        this.txService.posPayout(fromAccountId!, toIban, amount, description).subscribe({
            next: () => {
                this.posLoading.set(false);
                this.posSuccess.set('POS payout completed.');
                this.posForm.reset();
            },
            error: (err: Error) => {
                console.error('Error during POS payment:', err.cause);
                this.posError.set(err.message);
                this.posLoading.set(false);
            },
        });
    }

    onSubmitWithdraw() {
        if (this.withdrawForm.invalid) return;
        this.withdrawSuccess.set(null);
        this.withdrawError.set(null);
        this.withdrawLoading.set(true);
        const { accountId, amount, description } = this.withdrawForm.getRawValue();
        this.txService.withdraw(accountId!, amount, description).subscribe({
            next: () => {
                this.withdrawLoading.set(false);
                this.withdrawSuccess.set('Withdrawal completed.');
                this.withdrawForm.reset();
            },
            error: (err: Error) => {
                console.error('Error during withdraw:', err.cause);
                this.withdrawError.set(err.message);
                this.withdrawLoading.set(true);
            },
        });
    }

    onSubmitDeposit() {
        if (this.depositForm.invalid) return;
        this.depositSuccess.set(null);
        this.depositError.set(null);
        this.depositLoading.set(true);
        const { accountId, amount, description } = this.depositForm.getRawValue();
        this.txService.deposit(accountId!, amount, description).subscribe({
            next: () => {
                this.depositLoading.set(false);
                this.depositSuccess.set('Deposit completed.');
                this.depositForm.reset();
            },
            error: (err: Error) => {
                console.error('Error during deposit:', err.cause);
                this.depositError.set(err.message);
                this.depositLoading.set(false);
            },
        });
    }

    protected checkValidity(form: FormGroup, controlName: string, groupError?: string) {
        const control = form.get(controlName);
        const isTouchedOrDirty = control?.touched || control?.dirty;
        const hasGroupError = groupError ? form.hasError(groupError) : false;
        return isTouchedOrDirty && (control?.invalid || hasGroupError);
    }
}
