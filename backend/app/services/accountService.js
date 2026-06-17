import * as accountRepository from '../repositories/accountRepository.js'

export async function getAccountsByUserId(userId) {
    const accounts = await accountRepository.getAccountsByUserId(userId);
    return accounts;
}

export async function getAccountById(accountId, requestingUserId, requestingUserRole) {
    const account = await accountRepository.getAccountById(accountId);
    if (!account) {
        const err = new Error('NOT_FOUND');
        err.statusCode = 404;
        throw err;
    }
    if (account.userId !== requestingUserId && requestingUserRole !== 'ADMIN' && requestingUserRole !== 'MOD') {
        const err = new Error('FORBIDDEN');
        err.statusCode = 403;
        throw err;
    }
    return account;
}

export async function getAccountByIban(iban, requestingUserId, requestingUserRole) {
    const account = await accountRepository.getAccountByIban(iban);
    if (!account) {
        const err = new Error('NOT_FOUND');
        err.statusCode = 404;
        throw err;
    }
    if (account.userId !== requestingUserId && requestingUserRole !== 'ADMIN' && requestingUserRole !== 'MOD') {
        const err = new Error('FORBIDDEN');
        err.statusCode = 403;
        throw err;
    }
    return account;
}

export async function createAccount(userId, type) {
    try {
        if (!(await accountRepository.getAccountTypes()).includes(type)) {
            const e = new Error('UNKNOWN_ENUM');
            e.statusCode = 400;
            throw e;
        }
        let iban = 'HR123456789' + Math.floor(Math.random() * 1e10).toString().padStart(10, '0');
        const newAccount = await accountRepository.createAccount(iban, userId, type);
        return newAccount;
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            const dupErr = new Error('ACCOUNT_EXISTS', { cause: err });
            dupErr.statusCode = 409;
            throw dupErr;
        }
        throw err;
    }
}

export async function updateAccountStatus(accountId, status, userId) {
    try {
        return await accountRepository.updateAccountStatus(accountId, status, userId);
    } catch (err) {
        if (err.code === 'WARN_DATA_TRUNCATED') {
            const e = new Error('UNKNOWN_STATUS', { cause: err });
            e.statusCode = 400;
            throw e;
        }
        throw err;
    }
}
