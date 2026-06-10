import * as transactionRepository from "../repositories/transactionRepository.js";
import * as accountRepository from "../repositories/accountRepository.js";

export async function getTransactionsByAccountId(accountId) {
    const account = await accountRepository.getAccountById(accountId);
    if (!account) {
        const err = new Error('ACCOUNT_NOT_FOUND');
        err.statusCode = 404;
        throw err;
    }
    return await transactionRepository.getAllByAccountId(accountId);
}

export async function getTransactionsByUserId(userId) {
    return await transactionRepository.getAllByUserId(userId);
}

export async function transferFunds(fromAccId, toIban, amount, description, reqUserId, reqUserRole) {
    try {
        const [sourceAcc, destAcc] = await Promise.all([
            accountRepository.getAccountById(fromAccId),
            accountRepository.getAccountByIban(toIban)
        ]);
        if (!sourceAcc || !destAcc) {
            const err = new Error('ACCOUNT_NOT_FOUND');
            err.statusCode = 404;
            throw err;
        }
        if (sourceAcc.userId !== reqUserId && reqUserRole !== 'ADMIN' && reqUserRole !== 'MOD') {
            const e = new Error('FORBIDDEN');
            e.statusCode = 403;
            throw e;
        }
        const generatedDesc = `Transfer from ${sourceAcc.iban} to ${destAcc.iban}`;
        const fullDesc = description?.trim() ? `${generatedDesc} | ${description.trim()}` : generatedDesc;
        return await transactionRepository.transferFunds(fromAccId, destAcc.id, amount, fullDesc, reqUserId);
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

export async function posPayout(fromAccId, toAccId, amount, description, userId) {
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
        const generatedDesc = `POS payment from ${sourceAcc.iban} to ${destAcc.iban}`;
        const fullDesc = description?.trim() ? `${generatedDesc} | ${description.trim()}` : generatedDesc;
        return await transactionRepository.posPayout(fromAccId, toAccId, amount, fullDesc, userId);
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

export async function withdrawFunds(accId, amount, description, userId) {
    try {
        const account = await accountRepository.getAccountById(accId);
        if (!account) {
            const e = new Error('ACCOUNT_NOT_FOUND');
            e.statusCode = 404;
            throw e;
        }
        const generatedDesc = `Withdrawal from ${account.iban}`;
        const fullDesc = description?.trim() ? `${generatedDesc} | ${description.trim()}` : generatedDesc;
        return await transactionRepository.withdrawFunds(accId, amount, fullDesc, userId);
    } catch (err) {
        if (err.statusCode) throw err;
        if (err.sqlMessage === 'ACCOUNT_CLOSED') {
            const e = new Error('ACCOUNT_CLOSED', { cause: err });
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

export async function depositFunds(accId, amount, description, userId) {
    try {
        const account = await accountRepository.getAccountById(accId);
        if (!account) {
            const e = new Error('ACCOUNT_NOT_FOUND');
            e.statusCode = 404;
            throw e;
        }
        const generatedDesc = `Deposit to ${account.iban}`;
        const fullDesc = description?.trim() ? `${generatedDesc} | ${description.trim()}` : generatedDesc;
        return await transactionRepository.depositFunds(accId, amount, fullDesc, userId);
    } catch (err) {
        if (err.statusCode) throw err;
        if (err.sqlMessage === 'ACCOUNT_CLOSED') {
            const e = new Error('ACCOUNT_CLOSED', { cause: err });
            e.statusCode = 400;
            throw e;
        }
        throw err;
    }
}
