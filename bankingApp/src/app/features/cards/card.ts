export interface Card {
    id: number;
    accountId?: number;
    cardNumber: number;
    type: 'DEBIT' | 'CREDIT';
    status: 'ACTIVE' | 'BLOCKED' | 'EXPIRED';
    expiryDate: Date;
    createdAt: Date;
}
