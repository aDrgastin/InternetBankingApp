import { dbPool } from "../../config.js";

export async function getAllLogs(limit, offset) {
    let conn;
    try {
        conn = await dbPool.getConnection();
        const [[{total}]] = await conn.execute(`SELECT COUNT(*) AS total FROM AuditLog`);
        let [rows] = await conn.query(`SELECT al.id, al.table_name AS tableName, al.action, al.record_id AS recordId, u.username AS changedBy, al.old_data AS oldData, al.new_data AS newData, al.changed_at AS changedAt
            FROM AuditLog al LEFT JOIN User u ON changed_by = u.id
            ORDER BY changed_at DESC
            LIMIT ? OFFSET ?`, [limit, offset]);
            return { rows, total };
    } catch (err) {
        console.error('Error while fetching audit logs from database:', err);
        throw err;
    } finally {
        conn?.release();
    }
}
