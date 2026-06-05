export interface Account {
    id: number;
    iban: string;
    balance: number;
    status: 'ACTIVE' | 'CLOSED';
    type: string;
    createdAt: Date;
    userId?: number;
}
