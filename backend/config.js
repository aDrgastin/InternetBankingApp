import mysql2 from 'mysql2/promise'
import path from 'path';
import { fileURLToPath } from 'url';

export const port = process.env.port || process.env.PORT || 8080;

export let dbPool = null;
try {
    dbPool = mysql2.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'bank',
        connectionLimit: 10
    });
} catch (err) {
    console.error('Error while connecting to database:', err);
}

export const tokenLength = 32;
export const jwtSecret = process.env.JWT_SECRET;
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export default {
    port, dbPool, tokenLength, jwtSecret, __filename, __dirname
};