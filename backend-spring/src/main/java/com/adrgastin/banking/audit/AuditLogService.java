package com.adrgastin.banking.audit;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
@Slf4j
public class AuditLogService {
    private final AuditLogRepository auditLogRepository;

    public Page<AuditLogDTO> getAll(Pageable pageable) {
        return auditLogRepository.findAllView(pageable).map(AuditLogDTO::from);
    }
}
