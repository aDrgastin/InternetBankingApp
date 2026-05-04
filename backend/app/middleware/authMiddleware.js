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

    jwt.verify(token, config.jwtSecret, (err, decoded) => {
        if (err) {
            console.error('Error while validating token:', err);
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ status: 'TOKEN_EXPIRED' });
            }
            return res.status(403).json({ status: 'INVALID_TOKEN' });
        }
        req.decoded = decoded;
        next();
    });
}

/**
 * Validates whether the given JWT has one of the given user roles  
 * Has be called after verifyToken, otherwise returns status 401
 * @param  {...string} allowedRoles multiple string params representing user roles allowed to pass the middleware
 * @returns nothing if token exists and has any given role, status 401 if there's no token and status 403 if token doesn't have any given role
 */
export function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.decoded) {
            return res.status(401).json({ status: 'NO_TOKEN' });
        }
        if (!allowedRoles.includes(req.decoded.role)) {
            return res.status(403).json({ status: 'FORBIDDEN' });
        }
        next();
    };
}