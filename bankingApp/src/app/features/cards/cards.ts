import { Component, computed, inject, signal } from '@angular/core';
import { CardService } from '../../core/services/card-service';
import { Card } from './card';
import { AccountService } from '../../core/services/account-service';
import { DatePipe, SlicePipe, TitleCasePipe } from '@angular/common';
import { IbanPipe } from '../../shared/pipes/iban-pipe';
import { MaskCardNoPipe } from '../../shared/pipes/mask-card-no-pipe';

@Component({
  selector: 'app-cards',
  imports: [DatePipe, SlicePipe, IbanPipe, MaskCardNoPipe, TitleCasePipe],
  templateUrl: './cards.html',
  styleUrl: './cards.css',
})
export class Cards {
    private readonly cardService = inject(CardService);
    private accountService = inject(AccountService);

    cards = this.cardService.cards;
    accounts = this.accountService.accounts;
    typeFilter = signal<'ALL' | 'DEBIT' | 'CREDIT'>('ALL');
    statusFilter = signal<'ALL' | 'ACTIVE' | 'BLOCKED' | 'EXPIRED'>('ALL');
    selectedCard = signal<Card | null>(null);
    showConfirmModal = signal(false);
    pendingAction = signal<{ card: Card; action: 'BLOCK' | 'UNBLOCK' } | null>(null);

    filteredCards = computed(() => {
        let result = this.cards();
        if (this.typeFilter() !== 'ALL') {
            result = result.filter(c => c.type === this.typeFilter());
        }
        if (this.statusFilter() !== 'ALL') {
            result = result.filter(c => c.status === this.statusFilter());
        }
        return result;
    });

    stats = computed(() => {
        const all = this.cards();
        return {
            total: all.length,
            active: all.filter(c => c.status === 'ACTIVE').length,
            blocked: all.filter(c => c.status === 'BLOCKED').length,
            expired: all.filter(c => c.status === 'EXPIRED').length,
        };
    });

    getAccount(accountId?: number) {
        if (!accountId) return null;
        return this.accounts().find(a => a.id === accountId) ?? null;
    }

    isExpiringSoon(date: Date): boolean {
        const now = new Date();
        const diff = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
        return diff > 0 && diff <= 3;
    }

    selectCard(card: Card) {
        this.selectedCard.update(c => c?.id === card.id ? null : card);
    }

    requestAction(card: Card, action: 'BLOCK' | 'UNBLOCK') {
        this.pendingAction.set({ card, action });
        this.showConfirmModal.set(true);
    }

    confirmAction() {
        const pending = this.pendingAction();
        if (!pending) return;
        const newStatus = pending.action === 'BLOCK' ? 'BLOCKED' : 'ACTIVE';
        this.cardService.updateCardStatus(pending.card.id, newStatus).subscribe({
            next: () => {
                if (this.selectedCard()?.id === pending.card.id) {
                    this.selectedCard.set({ ...pending.card, status: newStatus });
                }
                this.cancelAction();
            },
            error: (err) => {
                console.error('Error while updating card status:', err);
                this.cancelAction();
            }
        });
    }

    cancelAction() {
        this.showConfirmModal.set(false);
        this.pendingAction.set(null);
    }

    setTypeFilter(type: 'ALL' | 'DEBIT' | 'CREDIT') {
        this.typeFilter.set(type);
    }

    setStatusFilter(status: 'ALL' | 'ACTIVE' | 'BLOCKED' | 'EXPIRED') {
        this.statusFilter.set(status);
    }
}
