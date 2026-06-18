import * as auditService from '../services/auditService.js';

export async function getAuditLog(req, res) {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const offset = (page - 1) * limit;

    try {
        const { rows, total } = await auditService.getAuditLog(limit, offset);
        return res.json({
            status: 'SUCCESS',
            data: rows,
            pagination: {
                page, limit, total, totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error('Error while fetching audit logs:', err);
        return res.status(500).end();
    }
}
