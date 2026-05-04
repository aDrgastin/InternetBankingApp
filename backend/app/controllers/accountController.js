import * as accountService from '../services/accountService.js'

export async function getMyAccounts(req, res) {
    const userId = req.decoded.id;
    try {
        const accounts = await accountService.getAccountsByUserId(userId);
        return res.json({ status: 'SUCCESS', accounts });
    } catch (err) {
        console.error('Error while fetching my accounts:', err);
        return res.status(500).end();
    }
}

export async function getAccountsByUserId(req, res) {
    const userId = req.params.userId;
    if (!userId) {
        return res.status(400).json({ status: 'MISSING_ID' });
    }
    if (req.decoded.id != userId && req.decoded.role === 'USER') {
        return res.status(403).json({ status: 'FORBIDDEN' });
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
    const accountId = req.params.accountId;
    if (!accountId) {
        return res.status(400).json({ status: 'MISSING_ID' });
    }

    try {
        const account = await accountService.getAccountById(accountId, req.decoded.id, req.decoded.role);
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
    if (!iban) {
        return res.status(400).json({ 'status': 'MISSING_IBAN' });
    }

    try {
        const account = await accountService.getAccountByIban(iban, req.decoded.id, req.decoded.role);
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
    const { userId, type } = req.body;
    if (!userId) return res.status(400).json({ status: 'MISSING_ID' });
    if (!type) return res.status(400).json({ status: 'MISSING_TYPE' });

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

export async function transferFunds(req, res) {
    const { fromAccId, toAccId, amount, description } = req.body;
    if (!fromAccId || !toAccId) {
        return res.status(400).json({ status: 'MISSING_ID' });
    }
    if (!amount) return res.status(400).json({ status: 'MISSING_AMOUNT' });
    
    try {
        const result = await accountService.transferFunds(fromAccId, toAccId, amount, description, req.decoded.id, req.decoded.role);
        return res.json({ status: 'SUCCESS' });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ status: err.message });
        }
        console.error('Unknown error while transfering funds:', err);
        return res.status(500).end();
    }
}

export async function updateAccountStatus(req, res) {
    const accountId = req.params.accountId;
    if (!accountId) {
        return res.status(400).json({ 'status': 'MISSING_ID' });
    }
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ 'status': 'MISSING_STATUS' });
    }

    try {
        const result = await accountService.updateAccountStatus(accountId, status, req.decoded.id);
        return res.json({ status: 'SUCCESS' });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ status: err.message });
        }
        console.error('Unknown error while updating account status:', err);
        return res.status(500).end();
    }
}