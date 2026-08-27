package com.adrgastin.banking.audit;

import java.time.LocalDateTime;

public interface AuditLogView {
    Integer getId();
    String getTableName();
    AuditAction getAction();
    Integer getRecordId();
    String getChangedBy();
    String getOldData();
    String getNewData();
    LocalDateTime getChangedAt();
}
