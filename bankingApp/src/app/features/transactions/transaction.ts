export interface Transaction {
    id: number;
    reference: string;
    type: string;
    fromAccountId: number | null;
    fromIban: string | null;
    toAccountId: number | null;
    toIban: string | null;
    amount: number;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    timestamp: Date;
    description: string;
    direction: 'CREDIT' | 'DEBIT';
}
