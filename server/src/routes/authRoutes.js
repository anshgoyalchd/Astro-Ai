import express from 'express';
import passport from 'passport';
import { body } from 'express-validator';
import { env } from '../config/env.js';
import {
  forgotPassword,
  googleCallbackSuccess,
  login,
  me,
  register,
  resendVerificationOtp,
  resetPassword,
  verifyEmailOtp
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

router.post('/register', [body('name').notEmpty().withMessage('Name is required'), body('email').isEmail().withMessage('Valid email is required'), body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'), validateRequest], register);
router.post('/login', [body('email').isEmail().withMessage('Valid email is required'), body('password').notEmpty().withMessage('Password is required'), validateRequest], login);
router.post('/forgot-password', [body('email').isEmail().withMessage('Valid email is required'), validateRequest], forgotPassword);
router.post('/reset-password', [body('token').notEmpty().withMessage('Reset token is required'), body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'), validateRequest], resetPassword);
router.get('/me', requireAuth, me);
router.post('/verify-email', [body('email').isEmail().withMessage('Valid email is required'), body('otp').isLength({ min: 6, max: 6 }).withMessage('Enter the 6 digit OTP'), validateRequest], verifyEmailOtp);
router.post('/resend-verification', [body('email').isEmail().withMessage('Valid email is required'), validateRequest], resendVerificationOtp);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${env.clientUrl}/login?googleError=token_exchange_failed` }), googleCallbackSuccess);

export default router;
