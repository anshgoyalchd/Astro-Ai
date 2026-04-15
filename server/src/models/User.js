import mongoose from 'mongoose';

const astrologyDataSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true },
    dob: String,
    time: String,
    city: String,
    state: String,
    country: String
  },
  { _id: false }
);

const reportCacheSchema = new mongoose.Schema(
  {
    signature: String,
    content: mongoose.Schema.Types.Mixed,
    createdAt: Date
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    password: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    avatar: String,
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationOtpHash: String,
    emailVerificationOtpExpires: Date,
    passwordResetTokenHash: String,
    passwordResetExpires: Date,
    astrologyData: astrologyDataSchema,
    chatCredits: { type: Number, default: 0 },
    isSubscribed: { type: Boolean, default: false },
    subscriptionExpiry: Date,
    reportCache: reportCacheSchema
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
