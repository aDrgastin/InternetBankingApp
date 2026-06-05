import express from 'express'
import { requireSelfOrRole, verifyToken } from '../middleware/authMiddleware.js'
import * as authController from '../controllers/authController.js'

const authRouter = express.Router();
authRouter.post('/login', authController.login);
authRouter.post('/register', authController.register);
authRouter.get('/me', verifyToken, authController.me);
authRouter.put('/:id', verifyToken, requireSelfOrRole('ADMIN', 'MOD'), authController.update);

export default authRouter;
