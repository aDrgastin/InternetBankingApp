import { dbPool } from "../../config.js";

export async function getAccountsByUserId(userId) {
    let conn;
    try {
        conn = await dbPool.getConnection();
        let [rows] = await conn.execute(`SELECT id, iban, balance, status, type, createdAt, userId
            FROM vw_account_details
            WHERE userId = ?`, [userId]);
        return rows;
    } catch (err) {
        console.error('Error while fetching accounts by userId from database:', err);
        throw err;
    } finally {
        conn?.release();
    }
}

export async function getAccountById(accountId) {
    let conn;
    try {
        conn = await dbPool.getConnection();
        let [result] = await conn.execute(`SELECT id, iban, balance, status, type, createdAt, userId
            FROM vw_account_details
            WHERE id = ?`, [accountId]);
        return result[0] ?? null;
    } catch (err) {
        console.error('Error while fetching account by id from database:', err);
        throw err;
    } finally {
        conn?.release();
    }
}

export async function getAccountByIban(iban) {
    let conn;
    try {
        conn = await dbPool.getConnection();
        let [result] = await conn.execute(`SELECT id, iban, balance, status, type, createdAt, userId
            FROM vw_account_details
            WHERE iban = ?`, [iban]);
        return result[0] ?? null;
    } catch (err) {
        console.error('Error while fetching account by iban from database:', err);
        throw err;
    } finally {
        conn?.release();
    }
}

export async function createAccount(iban, userId, type) {
    let conn;
    try {
        conn = await dbPool.getConnection();
        let [insert] = await conn.execute(`INSERT INTO Account (iban, type_id)
            VALUES (?, (SELECT id FROM AccountType WHERE name = ?))`, [iban, type]);
        let [assign] = await conn.execute(`INSERT INTO UserAccount (user_id, account_id)
            VALUES (?, ?)`, [userId, insert.insertId]);
        let [created] = await conn.execute(`SELECT id, iban, balance, status, type, createdAt, userId
            FROM vw_account_details
            WHERE id = ?`, [insert.insertId]);
        return created[0];
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            console.error('Account with the given iban already exists:', err);
            throw err;
        } else if (err.code === 'ER_WARN_DATA_TRUNCATED') {
            console.error('Unknown account type enum value:', err);
            throw err;
        }
        console.error('Error while adding a new account to database:', err);
        throw err;
    } finally {
        conn?.release();
    }
}

export async function updateAccountStatus(accountId, status, userId) {
    let conn;
    try {
        conn = await dbPool.getConnection();
        await conn.execute('SET @session_user_id = ?', [userId]);
        let [result] = await conn.execute(`UPDATE Account
            SET status = ?
            WHERE id = ?`, [status, accountId]);
        return result.affectedRows > 0;
    } catch (err) {
        if (err.code === 'WARN_DATA_TRUNCATED') {
            console.error(`Unknown status value (${status}):`, err);
            throw err;
        }
        console.error('Error while updating account status:', err);
        throw err;
    } finally {
        conn?.release();
    }
}
