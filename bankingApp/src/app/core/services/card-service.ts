import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Card } from '../../features/cards/card';
import { catchError, EMPTY, map, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CardService {
    private readonly API_ENDPOINT = `${environment.API_URL}/api/cards`;
    private readonly http = inject(HttpClient);

    private readonly cardsSignal = signal<Card[]>([]);
    readonly cards = this.cardsSignal.asReadonly();
    private loaded = false;

    loadCards() {
        if (this.loaded) return EMPTY;
        return this.http.get<{ status: string, cards: any[] }>(`${this.API_ENDPOINT}/my`).pipe(
            map(res => {
                if (!Array.isArray(res?.cards)) throw new Error('INVALID_RESPONSE');
                return res.cards.map(c => this.mapCard(c));
            }),
            tap(cards => {
                this.cardsSignal.set(cards);
                this.loaded = true;
            }),
            catchError((err: HttpErrorResponse) => {
                const status = err.error?.status;
                let message = 'Failed to load cards';
                if (status === 'UNAUTHORIZED') message = 'Session expired';
                return throwError(() => new Error(message, { cause: err }));
            })
        );
    }

    clearCards() {
        this.cardsSignal.set([]);
        this.loaded = false;
    }

    refetch() {
        this.loaded = false;
        return this.loadCards();
    }

    updateCardStatus(cardId: number, newStatus: string) {
        return this.http.patch<{ card: Card }>(`${this.API_ENDPOINT}/${cardId}/status`, { status: newStatus }).pipe(
            map(res => {
                if (!res.card) throw new Error('INVALID_RESPONSE');
                return this.mapCard(res.card);
            }),
            tap(card => {
                if (this.cardsSignal().some(c => c.id === card.id)) {
                    this.cardsSignal.update(cards =>
                        cards.map(c => c.id === card.id ? card : c)
                    );
                }
            }),
            catchError((err: HttpErrorResponse) => {
                const status = err.error?.status;
                let message = 'Failed to update status';
                if (status === 'FORBIDDEN') message = 'You are not authorized';
                else if (status === 'INVALID_ID') message = 'Invalid card';
                else if (status === 'NOT_FOUND') message = 'Card not found';
                else if (status === 'INVALID_STATUS' || status === 'UNKNOWN_ENUM') message = 'Invalid status value';
                return throwError(() => new Error(message, { cause: err }));
            })
        );
    }

    getCardsByUserId(userId: number) {
        return this.http.get<{ status: string, cards: any[] }>(`${this.API_ENDPOINT}/user/${userId}`).pipe(
            map(res => {
                if (!Array.isArray(res.cards)) throw new Error('INVALID_RESPONSE');
                return res.cards.map(c => this.mapCard(c));
            }),
            catchError((err: HttpErrorResponse) => {
                const status = err.error?.status;
                let message = 'Failed to load user cards';
                if (status === 'UNAUTHORIZED') message = 'Session expired';
                else if (status === 'USER_NOT_EXISTS') message = 'User doesnt exist';
                return throwError(() => new Error(message, { cause: err }));
            })
        );
    }

    getCardById(cardId: number) {
        return this.http.get<{ status: string, card: Card }>(`${this.API_ENDPOINT}/${cardId}`).pipe(
            map(res => {
                if (!res.card) throw new Error('INVALID_RESPONSE');
                return this.mapCard(res.card);
            }),
            catchError((err: HttpErrorResponse) => {
                const status = err.error?.status;
                let message = 'Failed to load cards';
                if (status === 'UNAUTHORIZED') message = 'Session expired';
                else if (status === 'INVALID_ID') message = 'Invalid id';
                else if (status === 'NOT_FOUND') message = 'Not found';
                else if (status === 'FORBIDDEN') message = 'Forbidden';
                return throwError(() => new Error(message, { cause: err }));
            })
        );
    }

    private mapCard(card: Card): Card {
        return {
            ...card,
            expiryDate: new Date(card.expiryDate),
            createdAt: new Date(card.createdAt)
        };
    }
}
