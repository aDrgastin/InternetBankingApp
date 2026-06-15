import * as transactionService from '../services/transactionService.js'

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
    const accountId = req.params.id;
    if (!(/^\d+$/).test(accountId)) {
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
    const userId = req.params.userId;
    if (!(/^\d+$/).test(userId)) {
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
    const { fromAccId, toIban, amount, description } = req.body;
    if (!fromAccId || !toIban || !amount) {
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
    const { fromAccId, toAccId, amount, description } = req.body;
    if (!fromAccId || !toAccId) {
        return res.status(400).json({ status: 'MISSING_ID' });
    }
    if (!amount) return res.status(400).json({ status: 'MISSING_AMOUNT' });
    
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
    const accId = req.params.accId;
    if (!(/^\d+$/).test(accId)) {
        return res.status(400).json({ status: 'INVALID_ID' });
    }
    const { amount, description } = req.body;
    if (!amount) {
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
    const accId = req.params.accId;
    if (!(/^\d+$/).test(accId)) {
        return res.status(400).json({ status: 'INVALID_ID' });
    }
    const { amount, description } = req.body;
    if (!amount) {
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
