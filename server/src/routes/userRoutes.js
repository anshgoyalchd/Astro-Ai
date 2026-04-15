import express from 'express';
import { body } from 'express-validator';
import { getProfile, updateAstrologyData } from '../controllers/userController.js';
import { requireAuth, requireVerifiedEmail } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

router.get('/profile', requireAuth, requireVerifiedEmail, getProfile);
router.put('/astrology-data', requireAuth, requireVerifiedEmail, [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('dob').notEmpty().withMessage('DOB is required'),
  body('time').notEmpty().withMessage('Birth time is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('country').notEmpty().withMessage('Country is required'),
  validateRequest
], updateAstrologyData);

export default router;
