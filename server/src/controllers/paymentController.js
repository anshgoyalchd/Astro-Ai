import Payment from '../models/Payment.js';
import { env } from '../config/env.js';
import { sendPaymentSuccessEmail } from '../services/emailService.js';
import { razorpay, verifyRazorpaySignature } from '../services/paymentService.js';
import { withLock } from '../utils/locks.js';
import { hasActiveSubscription } from '../utils/plan.js';

const PLAN_MAP = {
  credits_49: { amount: 4900, credits: 10 },
  subscription_299: { amount: 29900, subscriptionDays: 30 }
};

export async function createOrder(req, res) {
  const planType = req.body.planType;
  const plan = PLAN_MAP[planType];

  if (!plan) {
    return res.status(400).json({ message: 'Invalid plan selected' });
  }

  if (planType === 'subscription_299' && hasActiveSubscription(req.user)) {
    return res.status(400).json({ message: 'Your Cosmic Plan is already active.' });
  }

  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    return res.status(500).json({ message: 'Razorpay keys are missing on the server.' });
  }

  try {
    const receipt = `aa_${req.user.id.toString().slice(-8)}_${Date.now().toString().slice(-10)}`;

    const order = await razorpay.orders.create({
      amount: plan.amount,
      currency: 'INR',
      receipt,
      notes: {
        userId: req.user.id.toString(),
        planType
      }
    });

    const payment = await Payment.create({
      userId: req.user.id,
      amount: plan.amount,
      planType,
      status: 'created',
      razorpayOrderId: order.id
    });

    return res.status(201).json({
      order,
      paymentId: payment.id,
      key: env.razorpayKeyId
    });
  } catch (error) {
    console.error('Razorpay create order failed:', error);
    return res.status(502).json({
      message: error?.error?.description || error?.message || 'Razorpay could not create the order right now. Please try again.'
    });
  }
}

export async function verifyPayment(req, res) {
  return withLock(`payment:${req.body.paymentId}`, async () => {
    const { paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const payment = await Payment.findOne({ _id: paymentId, userId: req.user.id, razorpayOrderId });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status === 'paid') {
      const freshUser = await req.user.constructor.findById(req.user.id);
      return res.json({
        message: 'Payment already verified',
        user: {
          chatCredits: freshUser?.chatCredits ?? req.user.chatCredits,
          isSubscribed: freshUser?.isSubscribed ?? req.user.isSubscribed,
          subscriptionExpiry: freshUser?.subscriptionExpiry ?? req.user.subscriptionExpiry
        }
      });
    }

    const isValid = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature
    });

    if (!isValid) {
      payment.status = 'failed';
      await payment.save();
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    payment.status = 'paid';
    payment.razorpayPaymentId = razorpayPaymentId;

    if (payment.planType === 'credits_49') {
      req.user.chatCredits = (req.user.chatCredits || 0) + 10;
      payment.creditsAdded = 10;
    }

    if (payment.planType === 'subscription_299') {
      const now = new Date();
      const start = req.user.subscriptionExpiry && new Date(req.user.subscriptionExpiry) > now ? new Date(req.user.subscriptionExpiry) : now;
      start.setDate(start.getDate() + 30);
      req.user.isSubscribed = true;
      req.user.subscriptionExpiry = start;
      payment.subscriptionEndsAt = start;
    }

    await Promise.all([payment.save(), req.user.save()]);

    sendPaymentSuccessEmail({ user: req.user, payment }).catch((error) => {
      console.error('Payment success email failed:', error?.message || error);
    });

    return res.json({
      message: 'Payment verified successfully',
      user: {
        chatCredits: req.user.chatCredits,
        isSubscribed: req.user.isSubscribed,
        subscriptionExpiry: req.user.subscriptionExpiry
      }
    });
  });
}
