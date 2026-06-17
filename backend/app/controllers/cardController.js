import * as cardService from "../services/cardService.js";
import { parseId } from "../utils/utils.js";

export async function getMyCards(req, res) {
    const userId = res.locals.token.id;
    try {
        const cards = await cardService.getCardsByUserId(userId);
        return res.json({ status: 'SUCCESS', cards });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ status: err.message });
        }
        console.error('Error while fetching my cards:', err);
        return res.status(500).end();
    }
}

export async function getCardById(req, res) {
    const cardId = parseId(req.params.id);
    if (!cardId) {
        return res.status(400).json({ status: 'INVALID_ID' });
    }

    try {
        const card = await cardService.getCardById(cardId, res.locals.token.id, res.locals.token.role);
        return res.json({ status: 'SUCCESS', card });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ status: err.message });
        }
        console.error('Unknown error while fetching card by id:', err);
        return res.status(500).end();
    }
}

export async function getCardsByUserId(req, res) {
    const userId = parseId(req.params.id);
    if (!userId) {
        return res.status(400).json({ status: 'INVALID_ID' });
    }

    try {
        const cards = await cardService.getCardsByUserId(userId);
        return res.json({ status: 'SUCCESS', cards });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ status: err.message });
        }
        console.error('Error while fetching cards by user id:', err);
        return res.status(500).end();
    }
}

export async function createCard(req, res) {
    const { type } = req.body;
    const accountId = parseId(req.body.accountId);
    if (!accountId) {
        return res.status(400).json({ status: 'MISSING_ID' });
    }
    if (!type) {
        return res.status(400).json({ status: 'MISSING_DATA' });
    }

    try {
        const card = await cardService.createCard(accountId, type);
        return res.status(201).json({ status: 'SUCCESS', card });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ status: err.message });
        }
        console.error('Unknown error while creating a card:', err);
        return res.status(500).end();
    }
}

export async function updateCardStatus(req, res) {
    const cardId = parseId(req.params.cardId);
    if (!cardId) {
        return res.status(400).json({ status: 'INVALID_ID' });
    }
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ status: 'MISSING_DATA' });
    }

    try {
        const updated = await cardService.updateCardStatus(cardId, status, res.locals.token.id, res.locals.token.role);
        return res.json({ card: updated });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ status: err.message });
        }
        console.error('Unknown error while creating a card:', err);
        return res.status(500).end();
    }
}
