import express from 'express';
import { body } from 'express-validator';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
import { requireAuth, requireVerifiedEmail } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

router.use(requireAuth, requireVerifiedEmail);
router.post('/create-order', [body('planType').isIn(['credits_49', 'subscription_299']).withMessage('Valid plan type is required'), validateRequest], createOrder);
router.post('/verify', [body('paymentId').notEmpty().withMessage('Payment record is required'), body('razorpayOrderId').notEmpty().withMessage('Order id is required'), body('razorpayPaymentId').notEmpty().withMessage('Payment id is required'), body('razorpaySignature').notEmpty().withMessage('Signature is required'), validateRequest], verifyPayment);

export default router;
