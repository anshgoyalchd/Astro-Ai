import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

function isEmailConfigured() {
  return Boolean(env.smtpHost && env.smtpUser && env.smtpPass && env.mailFrom);
}

function createTransporter() {
  if (!isEmailConfigured()) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });
}

function appSignature() {
  return '\n\nWarmly,\nAstroAI';
}

export async function sendMail({ to, subject, text, html }) {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('Email skipped: SMTP is not configured.');
    return { skipped: true };
  }

  return transporter.sendMail({
    from: env.mailFrom,
    to,
    subject,
    text: `${text}${appSignature()}`,
    html
  });
}

export async function sendWelcomeEmail(user) {
  return sendMail({
    to: user.email,
    subject: 'Welcome to AstroAI',
    text: `Hi ${user.name},\n\nYour AstroAI account is ready. You can start with your free messages and generate your astrology reading whenever you are ready.`,
    html: `
      <div style="font-family: Georgia, serif; color: #25231f; line-height: 1.6;">
        <h2 style="color: #8e6a18;">Welcome to AstroAI</h2>
        <p>Hi ${user.name},</p>
        <p>Your AstroAI account is ready. You can start with your free messages and generate your astrology reading whenever you are ready.</p>
        <p style="margin-top: 24px;">Warmly,<br />AstroAI</p>
      </div>
    `
  });
}

export async function sendEmailVerificationOtp({ user, otp }) {
  return sendMail({
    to: user.email,
    subject: 'Verify your AstroAI email',
    text: `Hi ${user.name},\n\nYour AstroAI verification OTP is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Georgia, serif; color: #25231f; line-height: 1.6;">
        <h2 style="color: #8e6a18;">Verify your email</h2>
        <p>Hi ${user.name},</p>
        <p>Your AstroAI verification OTP is:</p>
        <div style="font-size: 28px; letter-spacing: 8px; font-weight: 700; color: #8e6a18; margin: 18px 0;">${otp}</div>
        <p>This code expires in 10 minutes.</p>
        <p style="margin-top: 24px;">Warmly,<br />AstroAI</p>
      </div>
    `
  });
}

export async function sendPasswordResetEmail({ user, resetUrl }) {
  return sendMail({
    to: user.email,
    subject: 'Reset your AstroAI password',
    text: `Hi ${user.name},\n\nUse this secure link to reset your password: ${resetUrl}\n\nThis link expires in 15 minutes. If you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family: Georgia, serif; color: #25231f; line-height: 1.6;">
        <h2 style="color: #8e6a18;">Reset your password</h2>
        <p>Hi ${user.name},</p>
        <p>Use the button below to reset your AstroAI password. This link expires in 15 minutes.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: #8e6a18; color: #ffffff; padding: 12px 20px; border-radius: 999px; text-decoration: none; font-weight: 700;">Reset Password</a>
        </p>
        <p>If the button does not work, copy this link into your browser:</p>
        <p style="word-break: break-all; color: #5d5649;">${resetUrl}</p>
        <p style="margin-top: 24px;">Warmly,<br />AstroAI</p>
      </div>
    `
  });
}

export async function sendPaymentSuccessEmail({ user, payment }) {
  const isSubscription = payment.planType === 'subscription_299';
  const planName = isSubscription ? 'Cosmic Plan' : 'Basic Plan';
  const amount = `Rs.${Math.round(payment.amount / 100)}`;
  const benefit = isSubscription
    ? `Your Cosmic Plan is active until ${new Date(payment.subscriptionEndsAt).toLocaleDateString('en-IN')}.`
    : `${payment.creditsAdded || 10} chat credits have been added to your account.`;

  return sendMail({
    to: user.email,
    subject: `AstroAI ${planName} payment confirmed`,
    text: `Hi ${user.name},\n\nYour payment of ${amount} for ${planName} was successful.\n\n${benefit}`,
    html: `
      <div style="font-family: Georgia, serif; color: #25231f; line-height: 1.6;">
        <h2 style="color: #8e6a18;">Payment Confirmed</h2>
        <p>Hi ${user.name},</p>
        <p>Your payment of <strong>${amount}</strong> for <strong>${planName}</strong> was successful.</p>
        <p>${benefit}</p>
        <p style="margin-top: 24px;">Warmly,<br />AstroAI</p>
      </div>
    `
  });
}
