import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    planType: { type: String, enum: ['credits_49', 'subscription_299'], required: true },
    status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    creditsAdded: Number,
    subscriptionEndsAt: Date
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);
