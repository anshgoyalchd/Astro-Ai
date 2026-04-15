import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { env } from '../config/env.js';
import User from '../models/User.js';
import { sendEmailVerificationOtp, sendPasswordResetEmail, sendWelcomeEmail } from '../services/emailService.js';
import { signToken } from '../utils/jwt.js';
import { checkRateLimit, rateLimitResponse } from '../utils/rateLimit.js';

const OTP_TTL_MINUTES = 10;
const RESET_TTL_MINUTES = 15;
const MINUTE = 60 * 1000;

function hashValue(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function createOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

function assignEmailOtp(user) {
  const otp = createOtp();
  user.emailVerificationOtpHash = hashValue(otp);
  user.emailVerificationOtpExpires = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  return otp;
}

function authPayload(user) {
  return {
    token: signToken(user),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      astrologyData: user.astrologyData,
      chatCredits: user.chatCredits,
      isSubscribed: user.isSubscribed,
      subscriptionExpiry: user.subscriptionExpiry
    }
  };
}

export async function register(req, res) {
  const { name, email, password } = req.body;
  const normalizedEmail = email.toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  const ipLimit = checkRateLimit({
    key: `register-email-ip:${req.ip}`,
    maxHits: 8,
    windowMs: 60 * MINUTE
  });
  const emailLimit = checkRateLimit({
    key: `register-email:${normalizedEmail}`,
    maxHits: 2,
    windowMs: 60 * MINUTE
  });

  if (!ipLimit.allowed || !emailLimit.allowed) {
    const retryAfter = Math.max(ipLimit.retryAfterSeconds, emailLimit.retryAfterSeconds);
    return rateLimitResponse(res, retryAfter, 'Too many registration emails requested. Please try again later.');
  }

  const user = new User({
    name,
    email: normalizedEmail,
    password: await bcrypt.hash(password, 10)
  });
  const otp = assignEmailOtp(user);
  await user.save();

  try {
    await sendEmailVerificationOtp({ user, otp });
  } catch (error) {
    await User.deleteOne({ _id: user.id });
    console.error('Email verification OTP failed:', error?.message || error);
    return res.status(502).json({ message: 'We could not send the verification OTP. Please try again later.' });
  }

  res.status(201).json({
    message: 'Account created. Please verify your email with the OTP we sent.',
    requiresVerification: true,
    email: user.email
  });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user || !user.password) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (!user.isEmailVerified) {
    const limit = checkRateLimit({
      key: `login-verification-otp:${user.id}`,
      maxHits: 3,
      windowMs: 15 * MINUTE
    });

    if (limit.allowed) {
      const otp = assignEmailOtp(user);
      await user.save();
      sendEmailVerificationOtp({ user, otp }).catch((error) => {
        console.error('Login verification OTP failed:', error?.message || error);
      });
    }

    return res.status(403).json({
      message: 'Please verify your email before signing in. We sent a fresh OTP if allowed.',
      requiresVerification: true,
      email: user.email
    });
  }

  res.json(authPayload(user));
}

export async function me(req, res) {
  res.json(authPayload(req.user));
}

export async function googleCallbackSuccess(req, res) {
  const { token } = authPayload(req.user);
  res.redirect(`${env.clientUrl}/login?token=${token}`);
}

export async function resendVerificationOtp(req, res) {
  const normalizedEmail = req.body.email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.json({ message: 'If this email is registered, a verification OTP has been sent.' });
  }

  if (user.isEmailVerified) {
    return res.json({ message: 'Email is already verified' });
  }

  const limit = checkRateLimit({
    key: `email-otp-resend:${user.id}`,
    maxHits: 3,
    windowMs: 15 * MINUTE
  });
  const ipLimit = checkRateLimit({
    key: `email-otp-resend-ip:${req.ip}`,
    maxHits: 8,
    windowMs: 15 * MINUTE
  });

  if (!limit.allowed || !ipLimit.allowed) {
    const retryAfter = Math.max(limit.retryAfterSeconds, ipLimit.retryAfterSeconds);
    return rateLimitResponse(res, retryAfter, 'Too many OTP emails requested. Please try again later.');
  }

  const otp = assignEmailOtp(user);
  await user.save();

  await sendEmailVerificationOtp({ user, otp });
  res.json({ message: 'Verification OTP sent' });
}

export async function verifyEmailOtp(req, res) {
  const { otp } = req.body;
  const normalizedEmail = req.body.email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  if (user.isEmailVerified) {
    return res.json({ message: 'Email is already verified', ...authPayload(user) });
  }

  const limit = checkRateLimit({
    key: `email-otp-verify:${user.id}`,
    maxHits: 5,
    windowMs: 15 * MINUTE
  });
  const ipLimit = checkRateLimit({
    key: `email-otp-verify-ip:${req.ip}:${normalizedEmail}`,
    maxHits: 5,
    windowMs: 15 * MINUTE
  });

  if (!limit.allowed || !ipLimit.allowed) {
    const retryAfter = Math.max(limit.retryAfterSeconds, ipLimit.retryAfterSeconds);
    return rateLimitResponse(res, retryAfter, 'Too many incorrect OTP attempts. Please try again later.');
  }

  const isExpired = !user.emailVerificationOtpExpires || user.emailVerificationOtpExpires < new Date();
  const isValid = user.emailVerificationOtpHash && hashValue(otp) === user.emailVerificationOtpHash;

  if (isExpired || !isValid) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  user.isEmailVerified = true;
  user.emailVerificationOtpHash = undefined;
  user.emailVerificationOtpExpires = undefined;
  await user.save();

  sendWelcomeEmail(user).catch((error) => {
    console.error('Welcome email failed:', error?.message || error);
  });

  res.json({ message: 'Email verified successfully', ...authPayload(user) });
}

export async function forgotPassword(req, res) {
  const { email } = req.body;
  const normalizedEmail = email.toLowerCase();
  const ipLimit = checkRateLimit({
    key: `password-reset-ip:${req.ip}`,
    maxHits: 8,
    windowMs: 60 * MINUTE
  });
  const emailLimit = checkRateLimit({
    key: `password-reset-email:${normalizedEmail}`,
    maxHits: 3,
    windowMs: 60 * MINUTE
  });

  if (!ipLimit.allowed || !emailLimit.allowed) {
    const retryAfter = Math.max(ipLimit.retryAfterSeconds, emailLimit.retryAfterSeconds);
    return rateLimitResponse(res, retryAfter, 'Too many password reset emails requested. Please try again later.');
  }

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.status(404).json({ message: 'Email not found. Please register first.' });
  }

  if (!user.password) {
    return res.status(400).json({ message: 'This email is registered with Google login. Please continue with Google.' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetTokenHash = hashValue(resetToken);
  user.passwordResetExpires = new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000);
  await user.save();

  const resetUrl = `${env.clientUrl}/reset-password?token=${resetToken}`;
  await sendPasswordResetEmail({ user, resetUrl });

  res.json({ message: 'Password reset link sent. Please check your email.' });
}

export async function resetPassword(req, res) {
  const { token, password } = req.body;
  const resetLimit = checkRateLimit({
    key: `password-reset-submit:${req.ip}`,
    maxHits: 10,
    windowMs: 15 * MINUTE
  });

  if (!resetLimit.allowed) {
    return rateLimitResponse(res, resetLimit.retryAfterSeconds, 'Too many reset attempts. Please try again later.');
  }

  const user = await User.findOne({
    passwordResetTokenHash: hashValue(token),
    passwordResetExpires: { $gt: new Date() }
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired reset link' });
  }

  user.password = await bcrypt.hash(password, 10);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successfully' });
}
