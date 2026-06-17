import { dbPool } from '../../config.js'

export async function fetchUserById(id) {
    let conn;
    try {
        conn = await dbPool.getConnection();
        const [rows] = await conn.execute(`SELECT id, pin, username, first_name AS firstName, last_name AS lastName, email, password, salt, role, created_at AS createdAt
            FROM User
            WHERE id = ?`, [id]);
            return rows[0] ?? null;
    } catch (err) {
        console.error('Error while fetching user by id from database:', err);
        throw err;
    } finally {
        conn?.release();
    }
}

export async function fetchUserByUsername(username) {
    let conn;
    try {
        conn = await dbPool.getConnection();
        let [rows] = await conn.execute(`SELECT id, pin, username, first_name AS firstName, last_name AS lastName, email, password, salt, role, created_at AS createdAt
            FROM User
            WHERE username = ?`, [username]);
        return rows[0] ?? null;
    } catch (err) {
        console.error('Error while fetching user by username from database:', err);
        throw err;
    } finally {
        conn?.release();
    }
}

export async function registerUser(newUser) {
    let conn;
    try {
        conn = await dbPool.getConnection();
        let [result] = await conn.execute(`INSERT INTO User (pin, username, first_name, last_name, email, salt, password)
            VALUES (?, ?, ?, ?, ?, ?, ?)`, [newUser.pin, newUser.username, newUser.firstName, newUser.lastName, newUser.email, newUser.salt, newUser.password]);
        let [added] = await conn.execute(`SELECT id, pin, username, first_name AS firstName, last_name AS lastName, email, role, created_at AS createdAt
            FROM User
            WHERE id = ?`, [result.insertId]);
        return added[0] ?? null;
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            console.error('User already exists:', err);
            throw err;
        }
        console.error('Error while adding a new user to the database:', err);
        throw err;
    } finally {
        conn?.release();
    }
}

export async function updateUser(id, updatedUser) {
    let conn;
    try {
        conn = await dbPool.getConnection();
        let [result] = await conn.execute(`UPDATE User
            SET pin = ?, username = ?, first_name = ?, last_name = ?, email = ?
            WHERE id = ?`, [updatedUser.pin, updatedUser.username, updatedUser.firstName, updatedUser.lastName, updatedUser.email, id]);
        if (result.affectedRows === 0) return null;
        let [updated] = await conn.execute(`SELECT id, pin, username, first_name AS firstName, last_name AS lastName, email, role, created_at AS createdAt
            FROM User
            WHERE id = ?`, [id]);
        return updated[0] ?? null;
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            console.error('Duplicate pin:', err);
            throw err;
        }
        console.error('Error while updating a user in the database:', err);
        throw err;
    } finally {
        conn?.release();
    }
}

export async function getAllUsers() {
    let conn;
    try {
        conn = await dbPool.getConnection();
        let [rows] = await conn.execute(`SELECT id, pin, username, first_name AS firstName, last_name AS lastName, email, role, created_at AS createdAt
            FROM User
            ORDER BY createdAt DESC`);
        return rows;
    } catch (err) {
        console.error('Error while fetching all users from the database:', err);
        throw err;
    } finally {
        conn?.release();
    }
}

export async function updatePassword(userId, newHash, newSalt) {
    let conn;
    try {
        conn = await dbPool.getConnection();
        await conn.execute(`UPDATE User SET password = ?, salt = ? WHERE id = ?`, [newHash, newSalt, userId]);
    } catch (err) {
        console.error('Error while changing user password in database:', err);
        throw err;
    } finally {
        conn?.release();
    }
}
