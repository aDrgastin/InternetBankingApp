package com.adrgastin.banking.audit;

import java.time.LocalDateTime;

public record AuditLogDTO(
        Integer id,
        String tableName,
        AuditAction action,
        Integer recordId,
        String changedBy,
        String oldData,
        String newData,
        LocalDateTime changedAt
) {
    public static AuditLogDTO from(AuditLogView view) {
        return new AuditLogDTO(view.getId(), view.getTableName(), view.getAction(), view.getRecordId(), view.getChangedBy() != null ? view.getChangedBy() : "SYSTEM", view.getOldData(), view.getNewData(), view.getChangedAt());
    }
}
