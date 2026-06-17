import * as authRepository from '../repositories/authRepository.js'
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import config from '../../config.js';

export async function login(username, password) {
    const user = await authRepository.fetchUserByUsername(username);
    if (!user) {
        console.error('User doesnt exist');
        const err = new Error('USER_NOT_FOUND');
        err.statusCode = 401;
        throw err;
    }
    if (!user.salt) {
        console.error('Missing salt!');
        const err = new Error('MISSING_SALT');
        err.statusCode = 401;
        throw err;
    }

    let hash = crypto.pbkdf2Sync(password, user.salt, 100000, 64, 'sha512').toString('hex');
    if (!(hash === user.password)) {
        console.error('Wrong password');
        const err = new Error('WRONG_PASSWORD');
        err.statusCode = 401;
        throw err;
    }

    const token = jwt.sign({
        sub: user.id,
        role: user.role,
    }, config.jwtSecret, { expiresIn: Number(config.jwtExpiresIn) });
    const userDTO = {
        id: user.id,
        pin: user.pin,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
    };

    return { token, userDTO };
}

export async function register(newUser) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(newUser.password, salt, 100000, 64, 'sha512').toString('hex');
    const insertUser = {
        pin: newUser.pin,
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        salt,
        password: hash
    };

    try {
        const registeredUser = await authRepository.registerUser(insertUser);
        const token = jwt.sign({
            sub: registeredUser.id,
            role: registeredUser.role
        }, config.jwtSecret, { expiresIn: Number(config.jwtExpiresIn) });

        return { token, registeredUser };
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            const dupErr = new Error('USER_EXISTS', { cause: err });
            dupErr.statusCode = 409;
            throw dupErr;
        }
        throw err;
    }
}

export async function getMe(userId) {
    const user = await authRepository.fetchUserById(userId);
    if (!user) {
        const err = new Error('USER_NOT_FOUND');
        err.statusCode = 404;
        throw err;
    }
    return user;
}

export async function updateUser(id, updatedUser) {
    try {
        const updated = await authRepository.updateUser(id, updatedUser);
        if (!updated) {
            const err = new Error('USER_NOT_FOUND');
            err.statusCode = 404;
            throw err;
        }
        return updated;
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            const dupErr = new Error('PIN_EXISTS', { cause: err });
            dupErr.statusCode = 409;
            throw dupErr;
        }
        throw err;
    }
}

export async function getAllUsers() {
    return await authRepository.getAllUsers();
}

export async function changePassword(userId, currentPassword, newPassword, requesterId) {
    const user = await authRepository.fetchUserById(userId);
    if (!user) {
        const err = new Error('USER_NOT_FOUND');
        err.statusCode = 404;
        throw err;
    }
    
    if (requesterId === userId) {
        const hash = crypto.pbkdf2Sync(currentPassword, user.salt, 100000, 64, 'sha512').toString('hex');
        if (hash !== user.password) {
            const e = new Error('WRONG_PASSWORD');
            e.statusCode = 401;
            throw e;
        }
    }
    const newSalt = crypto.randomBytes(16).toString('hex');
    const newHash = crypto.pbkdf2Sync(newPassword, newSalt, 100000, 64, 'sha512').toString('hex');
    await authRepository.updatePassword(userId, newHash, newSalt);
}
