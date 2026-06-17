import * as accountService from '../services/accountService.js'
import { parseId } from '../utils/utils.js'

export async function getMyAccounts(req, res) {
    const userId = res.locals.token.id;
    try {
        const accounts = await accountService.getAccountsByUserId(userId);
        return res.json({ status: 'SUCCESS', accounts });
    } catch (err) {
        console.error('Error while fetching my accounts:', err);
        return res.status(500).end();
    }
}

export async function getAccountsByUserId(req, res) {
    const userId = parseId(req.params.userId);
    if (!userId) {
        return res.status(400).json({ status: 'INVALID_ID' });
    }

    try {
        const accounts = await accountService.getAccountsByUserId(userId);
        return res.json({ status: 'SUCCESS', accounts });
    } catch (err) {
        console.error('Error while fetching accounts by userId:', err);
        return res.status(500).end();
    }
}

export async function getAccountById(req, res) {
    const accountId = parseId(req.params.accountId);
    if (!accountId) {
        return res.status(400).json({ status: 'INVALID_ID' });
    }

    try {
        const account = await accountService.getAccountById(accountId, res.locals.token.id, res.locals.token.role);
        return res.json({ status: 'SUCCESS', account });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ status: err.message });
        }
        console.error('Unknown error while fetching account by id:', err);
        return res.status(500).end();
    }
}

export async function getAccountByIban(req, res) {
    const iban = req.params.iban;

    try {
        const account = await accountService.getAccountByIban(iban, res.locals.token.id, res.locals.token.role);
        return res.json({ status: 'SUCCESS', account });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ status: err.message });
        }
        console.error('Unknown error while fetching account by iban:', err);
        return res.status(500).end();
    }
}

export async function createAccount(req, res) {
    const { type } = req.body;
    const userId = parseId(req.body.userId);
    if (!userId) {
        return res.status(400).json({ status: 'INVALID_ID' });
    }
    if (!type) return res.status(400).json({ status: 'MISSING_DATA' });

    try {
        const account = await accountService.createAccount(userId, type);
        return res.status(201).json({ status: 'SUCCESS', account });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ status: err.message });
        }
        console.error('Unknown error while creating an account:', err);
        return res.status(500).end();
    }
}

export async function updateAccountStatus(req, res) {
    const accountId = parseId(req.params.accountId);
    if (!accountId) {
        return res.status(400).json({ status: 'INVALID_ID' });
    }
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ 'status': 'MISSING_STATUS' });
    }

    try {
        const result = await accountService.updateAccountStatus(accountId, status, res.locals.token.id);
        return res.json({ status: 'SUCCESS' });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ status: err.message });
        }
        console.error('Unknown error while updating account status:', err);
        return res.status(500).end();
    }
}
