import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const chatSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'New Reading' },
    messages: [messageSchema],
    messageCount: { type: Number, default: 0 },
    report: mongoose.Schema.Types.Mixed,
    reportGeneratedAt: Date,
    reportInputSignature: String
  },
  { timestamps: true }
);

export default mongoose.model('Chat', chatSchema);
