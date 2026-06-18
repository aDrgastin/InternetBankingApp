export default interface AuditEntry {
    id: number;
    tableName: string;
    action: 'INSERT' | 'DELETE' | 'UPDATE';
    recordId: number;
    changedBy: string | null;
    oldData: string | null;
    newData: string | null;
    changedAt: Date;
}
