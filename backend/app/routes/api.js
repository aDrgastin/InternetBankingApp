import express from 'express'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import config from '../../config.js';

export default function() {
    const apiRouter = express.Router();

    apiRouter.route('/transactions').get(async (req, res) => {
        let conn;
        try {
            conn = await config.dbPool.getConnection();
            let [res] = await conn.execute('');
        } catch (err) {
            console.error('Error while fetching transactions from the database:', err);
            res.status(503).end();
        } finally {
            conn?.release();
        }
    });

    return apiRouter;
}