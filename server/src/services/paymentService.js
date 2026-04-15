import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../config/env.js';

export const razorpay = new Razorpay({
  key_id: env.razorpayKeyId,
  key_secret: env.razorpayKeySecret
});

export function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  const digest = crypto
    .createHmac('sha256', env.razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const expected = Buffer.from(digest);
  const received = Buffer.from(signature || '');

  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}
