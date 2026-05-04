import express from "express";
import * as accountController from '../controllers/accountController.js'
import { requireRole, verifyToken } from "../middleware/authMiddleware.js";

const accountRouter = express.Router();
accountRouter.get('/my', verifyToken, accountController.getMyAccounts);
accountRouter.get('/user/:userId', verifyToken, accountController.getAccountsByUserId);
accountRouter.get('/iban/:iban', verifyToken, accountController.getAccountByIban);
accountRouter.get('/:accountId', verifyToken, accountController.getAccountById);
accountRouter.post('', verifyToken, requireRole('ADMIN', 'MOD'), accountController.createAccount);
accountRouter.post('/transfer', verifyToken, accountController.transferFunds);
accountRouter.patch('/:accountId/status', verifyToken, requireRole('ADMIN', 'MOD'), accountController.updateAccountStatus);

export default accountRouter;