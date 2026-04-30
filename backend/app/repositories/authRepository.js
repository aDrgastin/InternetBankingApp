import { dbPool } from '../../config.js'

export async function fetchUserByUsername(username) {
    let conn;
    try {
        conn = await dbPool.getConnection();
        let [rows] = await conn.execute(`SELECT id, pin, username, first_name, last_name, email, password, salt, role
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
        let [added] = await conn.execute(`SELECT id, pin, username, first_name AS firstName, last_name AS lastName, email, role
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