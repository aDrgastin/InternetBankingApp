import * as cardService from "../services/cardService.js";

export async function getMyCards(req, res) {
    const userId = res.locals.token.id;
    try {
        const cards = await cardService.getCardsByUserId(userId);
        return res.json({ status: 'SUCCESS', cards });
    } catch (err) {
        console.error('Error while fetching my cards:', err);
        return res.status(500).end();
    }
}

export async function getCardById(req, res) {
    const cardId = req.params.id;
    if (!(/^\d+$/).test(cardId)) {
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

export async function createCard(req, res) {
    const { accountId, type } = req.body;
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
    const cardId = req.params.cardId;
    if (!(/^\d+$/).test(cardId)) {
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
