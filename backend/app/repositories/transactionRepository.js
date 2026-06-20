import { dbPool } from "../../config.js";

export async function getAllByAccountId(accountId) {
    let conn;
    try {
        conn = await dbPool.getConnection();
        let [rows] = await conn.execute(`SELECT t.id, reference, tt.name AS type, from_account_id AS fromAccountId, from_iban AS fromIban, to_account_id AS toAccountId, to_iban AS toIban, amount, t.status, timestamp, description,
            CASE
                WHEN tt.name = 'DEPOSIT' THEN 'CREDIT'
                WHEN tt.name IN ('WITHDRAWAL', 'FEE') THEN 'DEBIT'
                WHEN from_account_id = ? THEN 'DEBIT'
                ELSE 'CREDIT'
            END AS direction
            FROM Transaction t JOIN TransactionType tt ON t.type_id = tt.id
            WHERE from_account_id = ? OR to_account_id = ?
            ORDER BY timestamp DESC;`, [accountId, accountId, accountId]);
        return rows;
    } catch (err) {
        console.error('Error while fetching transactions by account id from database:', err);
        throw err;
    } finally {
        conn?.release();
    }
}

export async function getAllByUserId(userId) {
    let conn;
    try {
        conn = await dbPool.getConnection();
        let [rows] = await conn.execute(`SELECT DISTINCT id, reference, type, fromAccountId, fromIban, toAccountId, toIban, amount, status, timestamp, description,
                CASE
                    WHEN type = 'DEPOSIT' THEN 'CREDIT'
                    WHEN type IN ('WITHDRAWAL', 'FEE') THEN 'DEBIT'
                    WHEN userId = ? AND fromAccountId = accountId THEN 'DEBIT'
                    ELSE 'CREDIT'
                END AS direction
            FROM vw_user_transactions
            WHERE userId = ?
            ORDER BY timestamp DESC`, [userId, userId]);
        return rows;
    } catch (err) {
        console.error('Error while fetching transactions by user id from database:', err);
        throw err;
    } finally {
        conn?.release();
    }
}

export async function transferFunds(fromAccId, toAccId, amount, description, userId) {
    let conn;
    try {
        conn = await dbPool.getConnection();
        await conn.execute('SET @session_user_id = ?', [userId]);
        let [result] = await conn.execute(`CALL sp_transfer_funds(?, ?, ?, ?)`, [fromAccId, toAccId, amount, description]);
        return result[0];
    } catch (err) {
        console.error('Error while transfering funds:', err);
        throw err;
    } finally {
        conn?.release();
    }
}

export async function posPayout(fromAccId, toAccId, amount, description, userId) {
    let conn;
    try {
        conn = await dbPool.getConnection();
        await conn.execute('SET @session_user_id = ?', [userId]);
        let [result] = await conn.execute(`CALL sp_pos_payout(?, ?, ?, ?)`, [fromAccId, toAccId, amount, description]);
        return result[0];
    } catch (err) {
        console.error('Error while doing a POS payout:', err);
        throw err;
    } finally {
        conn?.release();
    }
}

export async function withdrawFunds(accId, amount, description, userId) {
    let conn;
    try {
        conn = await dbPool.getConnection();
        await conn.execute('SET @session_user_id = ?', [userId]);
        let [result] = await conn.execute(`CALL sp_withdraw_funds(?, ?, ?)`, [accId, amount, description]);
        return result[0];
    } catch (err) {
        console.error('Error while withdrawing funds:', err);
        throw err;
    } finally {
        conn?.release();
    }
}

export async function depositFunds(accId, amount, description, userId) {
    let conn;
    try {
        conn = await dbPool.getConnection();
        await conn.execute('SET @session_user_id = ?', [userId]);
        let [result] = await conn.execute(`CALL sp_deposit_funds(?, ?, ?)`, [accId, amount, description]);
        return result[0];
    } catch (err) {
        console.error('Error while depositing funds:', err);
        throw err;
    } finally {
        conn?.release();
    }
}
