import express from 'express'
import { requireRole, requireSelfOrRole, verifyToken } from '../middleware/authMiddleware.js'
import * as authController from '../controllers/authController.js'

const authRouter = express.Router();
authRouter.get('/me', verifyToken, authController.me);
authRouter.get('/users', verifyToken, requireRole('ADMIN', 'MOD'), authController.getAllUsers);
authRouter.post('/login', authController.login);
authRouter.post('/register', authController.register);
authRouter.put('/:id', verifyToken, requireSelfOrRole('ADMIN', 'MOD'), authController.update);

export default authRouter;
