import jwt from 'jsonwebtoken'
import config from '../../config.js'

/**
 * Extracts token from authorization header and stores decoded token in req.decoded
 * @param {import("express").Request} req Request object
 * @param {import("express").Response} res Response object
 * @param {import("express").NextFunction} next function that executes succeeding middleware
 * @returns nothing if token is existing and valid, status 401 if not existing and status 403 if invalid
 */
export function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ status: 'NO_TOKEN' });
    }
    const token = authHeader.split(' ')[1];
    console.log('Token:', token);

    jwt.verify(token, config.jwtSecret, (err, decoded) => {
        if (err) {
            console.error('Error while validating token:', err);
            return res.status(403).json({ status: 'INVALID_TOKEN' });
        }
        req.decoded = decoded;
        console.log('Decoded JWT:', decoded);
        next();
    });
}