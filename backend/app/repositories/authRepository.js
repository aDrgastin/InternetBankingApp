import { dbPool } from '../../config.js'

export async function fetchUserByUsername(username) {
    let conn;
    try {
        conn = await dbPool.getConnection();
        let [rows] = await conn.query('SELECT id, username, name, email, password, salt, role FROM users WHERE username = ?', [username]);
        return rows;
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
        let [result] = await dbPool.query('INSERT INTO users SET ?', [newUser]);
        let [added] = await dbPool.query('SELECT id, username, name, email, role FROM users WHERE id = ?', [result.insertId]);
        return added;
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