import * as auditRepository from '../repositories/auditRepository.js';

export async function getAuditLog(limit, offset) {
    return await auditRepository.getAllLogs(limit, offset);
}
