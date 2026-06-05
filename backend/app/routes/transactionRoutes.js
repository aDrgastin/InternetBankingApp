import express from 'express'
import { requireRole, verifyToken } from '../middleware/authMiddleware.js';
import * as transactionController from '../controllers/transactionController.js';

const transactionRouter = express.Router();
transactionRouter.get('/my', verifyToken, transactionController.getMyTransactions);
transactionRouter.get('/account/:id', verifyToken, requireRole('ADMIN', 'MOD'), transactionController.getTransactionsByAccId);
transactionRouter.post('/transfer', verifyToken, transactionController.transferFunds);
transactionRouter.post('/pos', verifyToken, requireRole('ADMIN', 'MOD'), transactionController.posPayout);
transactionRouter.post('/withdraw/:accId', verifyToken, requireRole('ADMIN', 'MOD'), transactionController.withdrawFunds);
transactionRouter.post('/deposit/:accId', verifyToken, requireRole('ADMIN', 'MOD'), transactionController.depositFunds);

export default transactionRouter;
