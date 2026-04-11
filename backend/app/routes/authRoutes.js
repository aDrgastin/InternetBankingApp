import express from 'express'
import { verifyToken } from '../middleware/authMiddleware.js'
import * as authController from '../controllers/authController.js'

const authRouter = express.Router();
authRouter.post('/login', authController.login);
authRouter.post('/register', authController.register);
authRouter.get('/me', verifyToken, authController.me);

export default authRouter;