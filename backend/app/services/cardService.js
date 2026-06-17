import * as cardRepository from "../repositories/cardRepository.js";
import * as authRepository from "../repositories/authRepository.js";
import crypto from "node:crypto";

export async function getCardsByUserId(userId) {
    if (!(await authRepository.fetchUserById(userId))) {
        const e = new Error('USER_NOT_EXISTS');
        e.statusCode = 404;
        throw e;
    }
    return await cardRepository.getCardsByUserId(userId);
}

export async function getCardById(cardId, requestingUserId, requestingUserRole) {
    const card = await cardRepository.getCardById(cardId);
    if (!card) {
        const err = new Error('NOT_FOUND');
        err.statusCode = 404;
        throw err;
    }
    if (card.userId !== requestingUserId && requestingUserRole !== 'ADMIN' && requestingUserRole !== 'MOD') {
        const err = new Error('FORBIDDEN');
        err.statusCode = 403;
        throw err;
    }
    return card;
}

export async function createCard(accountId, type) {
    const randomBytes = crypto.randomBytes(8);
    const bigIntString = BigInt(`0x${randomBytes.toString('hex')}`).toString();
    let cardNumber = bigIntString.padEnd(16, '0').slice(0, 16);
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 3);
    expiryDate.setMonth(expiryDate.getMonth() + 1, 0);
    expiryDate.setHours(23, 59, 59, 999);

    try {
        const newCard = await cardRepository.createCard(accountId, cardNumber, type, expiryDate);
        return newCard;
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            const e = new Error('CARD_EXISTS', { cause: err });
            e.statusCode = 409;
            throw e;
        } else if (err.code === 'WARN_DATA_TRUNCATED') {
            const e = new Error('UNKNOWN_ENUM', { cause: err });
            e.statusCode = 400;
            throw e;
        }
        throw err;
    }
}

export async function updateCardStatus(cardId, newStatus, reqUserId, reqUserRole) {
    const card = await cardRepository.getCardById(cardId);
    if (!card) {
        const e = new Error('NOT_FOUND');
        e.statusCode = 404;
        throw e;
    }
    if (card.userId !== reqUserId && reqUserRole !== 'ADMIN' && reqUserRole !== 'MOD') {
        const e = new Error('FORBIDDEN');
        e.statusCode = 403;
        throw e;
    }
    if (newStatus === 'EXPIRED') {
        const e = new Error('INVALID_STATUS');
        e.statusCode = 400;
        throw e;
    }
    try {
        return await cardRepository.updateCardStatus(cardId, newStatus);
    } catch (err) {
        if (err.code === 'WARN_DATA_TRUNCATED') {
            const e = new Error('UNKNOWN_ENUM', { cause: err });
            e.statusCode = 400;
            throw e;
        }
        throw err;
    }
}
