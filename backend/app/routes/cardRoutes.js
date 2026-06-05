import express from "express";
import { requireRole, verifyToken } from "../middleware/authMiddleware.js";
import * as cardController from "../controllers/cardController.js";

const cardRouter = express.Router();
cardRouter.get('/my', verifyToken, cardController.getMyCards);
cardRouter.get('/:id', verifyToken, cardController.getCardById);
cardRouter.post('', verifyToken, requireRole('ADMIN', 'MOD'), cardController.createCard);
cardRouter.patch('/:cardId/status', verifyToken, cardController.updateCardStatus);

export default cardRouter;
