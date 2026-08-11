package com.adrgastin.banking.auditlog;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "table_name", nullable = false, length = 45)
    private String tableName;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AuditAction action;

    @Column(name = "record_id", nullable = false)
    private Integer recordId;

    @Column(name = "changed_by")
    private Integer changedBy;

    @Column(name = "old_data")
    @JdbcTypeCode(SqlTypes.JSON)
    private String oldData;

    @Column(name = "new_data")
    @JdbcTypeCode(SqlTypes.JSON)
    private String newData;

    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt;
}
