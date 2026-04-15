import express from 'express';
import { body } from 'express-validator';
import { createChatSession, deleteChat, downloadReport, getChat, listChats, sendMessage } from '../controllers/chatController.js';
import { requireAuth, requireVerifiedEmail } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

router.use(requireAuth, requireVerifiedEmail);
router.get('/sessions', listChats);
router.post('/sessions', createChatSession);
router.get('/sessions/:chatId', getChat);
router.delete('/sessions/:chatId', deleteChat);
router.post('/sessions/:chatId/message', [body('message').notEmpty().withMessage('Message is required'), validateRequest], sendMessage);
router.get('/sessions/:chatId/report-pdf', downloadReport);

export default router;
