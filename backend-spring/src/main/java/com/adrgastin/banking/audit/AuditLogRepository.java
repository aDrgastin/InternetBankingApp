package com.adrgastin.banking.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AuditLogRepository extends JpaRepository<AuditLog,Integer> {
    @Query(value = """
        SELECT al.id, al.table_name AS tableName, al.action, al.record_id AS recordId, u.username AS changedBy, al.old_data AS oldData, al.new_data AS newData, al.changed_at AS changedAt
        FROM audit_log al LEFT JOIN app_user u ON changed_by = u.id
        ORDER BY changed_at DESC
    """, countQuery = "SELECT COUNT(*) FROM audit_log", nativeQuery = true)
    Page<AuditLogView> findAllView(Pageable pageable);
}
