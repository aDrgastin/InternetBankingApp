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

    let hash = crypto.pbkdf2Sync(password, user.salt, 100000, 64, 'sha512');
    //console.log('Hash: ', hash.toString('hex'));
    let match = hash.toString('hex') === user.password;
    if (!match) {
        console.error('Wrong password');
        const err = new Error('WRONG_PASSWORD');
        err.statusCode = 401;
        throw err;
    }

    const token = jwt.sign({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role
    }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

    return { token, user }; // SECURITY ISSUE! Make sure to return user DTO!
}

export async function register(newUser) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(newUser.password, salt, 100000, 64, 'sha512').toString('hex');
    const insertUser = {
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        salt,
        password: hash
    };

    try {
        const registeredUser = await authRepository.registerUser(insertUser);
        const token = jwt.sign({
            id: registeredUser.id,
            username: registeredUser.username,
            name: registeredUser.name,
            email: registeredUser.email,
            role: registeredUser.role
        }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

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