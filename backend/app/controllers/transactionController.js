import * as transactionService from '../services/transactionService.js'
import { parseId } from '../utils/utils.js'

export async function getMyTransactions(req, res) {
    const userId = res.locals.token.id;
    try {
        const transactions = await transactionService.getTransactionsByUserId(userId);
        return res.json({ status: 'SUCCESS', transactions });
    } catch (err) {
        console.error('Error while fetching current user transactions:', err);
        return res.status(500).end();
    }
}

export async function getTransactionsByAccId(req, res) {
    const accountId = parseId(req.params.id);
    if (!accountId) {
        return res.status(400).json({ status: 'INVALID_ID' });
    }

    try {
        const transactions = await transactionService.getTransactionsByAccountId(accountId);
        return res.json({ status: 'SUCCESS', transactions });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ status: err.message });
        }
        console.error('Error while fetching transactions:', err);
        return res.status(500).end();
    }
}

export async function getTransactionsByUserId(req, res) {
    const userId = parseId(req.params.userId);
    if (!userId) {
        return res.status(400).json({ status: 'INVALID_ID' });
    }

    try {
        const transactions = await transactionService.getTransactionsByUserId(userId);
        return res.json({ status: 'SUCCESS', transactions });
    } catch (err) {
        console.error('Error while fetching transactions:', err);
        return res.status(500).end();
    }
}

export async function transferFunds(req, res) {
    const fromAccId = parseId(req.body.fromAccId);
    const amount = Number(req.body.amount);
    const { toIban, description } = req.body;
    if (!fromAccId || !Number.isFinite(amount) || amount <= 0 || !toIban) {
        return res.status(400).json({ status: 'MISSING_DATA' });
    }
    
    try {
        const result = await transactionService.transferFunds(fromAccId, toIban, amount, description, res.locals.token.id, res.locals.token.role);
        return res.json({ status: 'SUCCESS' });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ status: err.message });
        }
        console.error('Unknown error while transfering funds:', err);
        return res.status(500).end();
    }
}

export async function posPayout(req, res) {
    const fromAccId = parseId(req.body.fromAccId);
    const amount = Number(req.body.amount);
    const { toIban, description } = req.body;
    if (!fromAccId || !Number.isFinite(amount) || amount <= 0 || !toIban) {
        return res.status(400).json({ status: 'MISSING_DATA' });
    }
    
    try {
        const result = await transactionService.posPayout(fromAccId, toIban, amount, description, res.locals.token.id);
        return res.json({ status: 'SUCCESS' });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ status: err.message });
        }
        console.error('Unknown error during POS payout:', err);
        return res.status(500).end();
    }
}

export async function withdrawFunds(req, res) {
    const accId = parseId(req.params.accId);
    if (!accId) {
        return res.status(400).json({ status: 'INVALID_ID' });
    }
    const { description } = req.body;
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({ status: 'MISSING_DATA' });
    }

    try {
        const result = await transactionService.withdrawFunds(accId, amount, description, res.locals.token.id);
        return res.json({ status: 'SUCCESS' });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ status: err.message });
        }
        console.error('Unknown error while withdrawing funds:', err);
        return res.status(500).end();
    }
}

export async function depositFunds(req, res) {
    const accId = parseId(req.params.accId);
    if (!accId) {
        return res.status(400).json({ status: 'INVALID_ID' });
    }
    const { description } = req.body;
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({ status: 'MISSING_DATA' });
    }

    try {
        const result = await transactionService.depositFunds(accId, amount, description, res.locals.token.id);
        return res.json({ status: 'SUCCESS' });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ status: err.message });
        }
        console.error('Unknown error while withdrawing funds:', err);
        return res.status(500).end();
    }
}
