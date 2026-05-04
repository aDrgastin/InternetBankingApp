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
    if (requestingUserRole === 'USER' && account.userId !== requestingUserId) {
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
    if (requestingUserRole === 'USER' && account.userId !== requestingUserId) {
        const err = new Error('FORBIDDEN');
        err.statusCode = 403;
        throw err;
    }
    return account;
}

export async function createAccount(userId, type) {
    let iban = 'HR1234567' + Math.floor(Math.random() * 1e10).toString().padStart(10, '0');
    try {
        const newAccount = await accountRepository.createAccount(iban, userId, type);
        return newAccount; // RETURN DTO?????????
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            const dupErr = new Error('ACCOUNT_EXISTS', { cause: err });
            dupErr.statusCode = 409;
            throw dupErr;
        } else if (err.code === 'ER_WARN_DATA_TRUNCATED') {
            const dupErr = new Error('UNKNOWN_TYPE', { cause: err });
            dupErr.statusCode = 400;
            throw dupErr;
        }
        throw err;
    }
}

export async function transferFunds(fromAccId, toAccId, amount, description, userId, userRole) {
    try {
        const [sourceAcc, destAcc] = await Promise.all([
            accountRepository.getAccountById(fromAccId),
            accountRepository.getAccountById(toAccId)
        ]);
        if (!sourceAcc || !destAcc) {
            const err = new Error('ACCOUNT_NOT_FOUND');
            err.statusCode = 404;
            throw err;
        }
        if (userRole === 'USER' && sourceAcc.userId !== parseInt(userId)) {
            const err = new Error('UNAUTHORIZED_ACCOUNT_ACCESS');
            err.statusCode = 403;
            throw err;
        }
        const generatedDesc = `Transfer from ${sourceAcc.iban} to ${destAcc.iban}`;
        const fullDesc = description?.trim() ? `${generatedDesc} | ${description.trim()}` : generatedDesc;
        return await accountRepository.transferFunds(fromAccId, toAccId, amount, fullDesc, userId);
    } catch (err) {
        if (err.statusCode) throw err;
        if (err.sqlMessage === 'SOURCE_ACCOUNT_CLOSED') {
            const e = new Error('SOURCE_ACCOUNT_CLOSED', { cause: err });
            e.statusCode = 400;
            throw e;
        } else if (err.sqlMessage === 'DESTINATION_ACCOUNT_CLOSED') {
            const e = new Error('DESTINATION_ACCOUNT_CLOSED', { cause: err });
            e.statusCode = 400;
            throw e;
        } else if (err.sqlMessage === 'INSUFFICIENT_FUNDS') {
            const e = new Error('INSUFFICIENT_FUNDS', { cause: err });
            e.statusCode = 400;
            throw e;
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