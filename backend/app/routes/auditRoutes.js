import express from 'express';
import { requireRole, verifyToken } from '../middleware/authMiddleware.js';
import * as auditController from '../controllers/auditController.js';

const auditRouter = express.Router();
auditRouter.get('', verifyToken, requireRole('ADMIN'), auditController.getAuditLog);

export default auditRouter;
