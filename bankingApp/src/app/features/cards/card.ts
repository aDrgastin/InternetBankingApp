export interface Card {
    id: number;
    accountId?: number;
    number: string;
    type: 'DEBIT' | 'CREDIT';
    status: 'ACTIVE' | 'BLOCKED' | 'EXPIRED';
    expiryDate: Date;
    createdAt: Date;
}
