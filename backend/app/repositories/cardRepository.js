import { dbPool } from "../../config.js";

export async function getCardsByUserId(userId) {
    let conn;
    try {
        conn = await dbPool.getConnection();
        let [rows] = await conn.execute(`SELECT id, accountId, iban, number, type, status, expiryDate, createdAt
            FROM vw_user_cards
            WHERE userId = ?`, [userId]);
        return rows;
    } catch (err) {
        console.error('Error while fetching cards by userId from database:', err);
        throw err;
    } finally {
        conn?.release();
    }
}

export async function getCardById(cardId) {
    let conn;
    try {
        conn = await dbPool.getConnection();
        let [result] = await conn.execute(`SELECT id, accountId, userId, iban, number, type, status, expiryDate, createdAt
            FROM vw_user_cards
            WHERE id = ?`, [cardId]);
        return result[0] ?? null;
    } catch (err) {
        console.error('Error while fetching card by id from database:', err);
        throw err;
    } finally {
        conn?.release();
    }
}

export async function createCard(accountId, cardNumber, type, expiryDate) {
    let conn;
    try {
        conn = await dbPool.getConnection();
        let [insert] = await conn.execute(`INSERT INTO Card (account_id, card_number, card_type, status, expiry_date) VALUES (?, ?, ?, ?, ?)`, [accountId, cardNumber, type, 'ACTIVE', expiryDate]);
        if (insert.affectedRows === 0) return null;
        let [created] = await conn.execute(`SELECT id, accountId, iban, number, type, status, expiryDate, createdAt
            FROM vw_user_cards
            WHERE id = ?`, [insert.insertId]);
        return created[0] ?? null;
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            console.error('Card with the given id already exists:', err);
            throw err;
        } else if (err.code === 'WARN_DATA_TRUNCATED') {
            console.error('Unknown card type or status enum value:', err);
            throw err;
        }
        console.error('Error while adding a new card to database:', err);
        throw err;
    } finally {
        conn?.release();
    }
}

export async function updateCardStatus(cardId, newStatus) {
    let conn;
    try {
        conn = await dbPool.getConnection();
        let [result] = await conn.execute(`UPDATE Card SET status = ? WHERE id = ?`, [newStatus, cardId]);
        if (result.affectedRows === 0) return null;
        let [updated] = await conn.execute(`SELECT id, accountId, userId, iban, number, type, status, expiryDate, createdAt
            FROM vw_user_cards
            WHERE id = ?`, [cardId]);
        return updated[0] ?? null;
    } catch (err) {
        if (err.code === 'WARN_DATA_TRUNCATED') {
            console.error('Unknown card status enum value:', err);
            throw err;
        }
        console.error('Error while updating card status:', err);
        throw err;
    } finally {
        conn?.release();
    }
}
