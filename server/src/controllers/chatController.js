import Chat from '../models/Chat.js';
import { generateChatReply, generateInitialReport } from '../services/geminiService.js';
import { withLock } from '../utils/locks.js';
import { renderReportPdf } from '../services/pdfService.js';
import { getChatLimitState, hasActiveSubscription } from '../utils/plan.js';

function astrologySignature(data) {
  return JSON.stringify(data || {});
}

async function ensureReport(user) {
  if (!user.astrologyData?.fullName || !user.astrologyData?.dob || !user.astrologyData?.time || !user.astrologyData?.city || !user.astrologyData?.state || !user.astrologyData?.country) {
    const error = new Error('Please complete your astrology profile first');
    error.statusCode = 400;
    throw error;
  }

  const signature = astrologySignature(user.astrologyData);
  if (user.reportCache?.signature === signature && user.reportCache?.content) {
    return user.reportCache.content;
  }

  const report = await generateInitialReport(user.astrologyData);
  user.reportCache = {
    signature,
    content: report,
    createdAt: new Date()
  };
  await user.save();
  return report;
}

export async function createChatSession(req, res) {
  const report = await ensureReport(req.user);
  const chat = await Chat.create({
    userId: req.user.id,
    title: req.body.title || 'New Reading',
    report,
    reportGeneratedAt: new Date(),
    reportInputSignature: astrologySignature(req.user.astrologyData),
    messages: []
  });

  res.status(201).json({ chat });
}

export async function listChats(req, res) {
  const chats = await Chat.find({ userId: req.user.id }).select('_id title messageCount updatedAt createdAt').sort({ updatedAt: -1 });
  res.json({ chats });
}

export async function getChat(req, res) {
  const chat = await Chat.findOne({ _id: req.params.chatId, userId: req.user.id });
  if (!chat) {
    return res.status(404).json({ message: 'Chat not found' });
  }

  const limitState = getChatLimitState(req.user, chat);
  res.json({ chat, limitState });
}

export async function deleteChat(req, res) {
  const chat = await Chat.findOneAndDelete({ _id: req.params.chatId, userId: req.user.id });
  if (!chat) {
    return res.status(404).json({ message: 'Chat not found' });
  }

  res.json({ message: 'Chat deleted successfully', chatId: req.params.chatId });
}

export async function sendMessage(req, res) {
  return withLock(`user-chat:${req.user.id}`, async () => {
    const chat = await Chat.findOne({ _id: req.params.chatId, userId: req.user.id });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const question = req.body.message?.trim();
    if (!question) {
      return res.status(400).json({ message: 'Message is required' });
    }

    await req.user.constructor.findById(req.user.id).then((freshUser) => {
      req.user = freshUser || req.user;
    });

    const limitState = getChatLimitState(req.user, chat);
    if (!limitState.allowed) {
      return res.status(402).json({
        message: 'Message limit reached',
        limitState,
        showPricing: true
      });
    }

    const report = chat.report || (await ensureReport(req.user));
    const reply = await generateChatReply(req.user.astrologyData, report, chat.messages, question);

    chat.messages.push({ role: 'user', content: question });
    chat.messages.push({ role: 'assistant', content: reply });
    chat.messageCount += 1;
    chat.report = report;
    if (chat.messageCount === 1) {
      chat.title = question.slice(0, 40);
    }
    await chat.save();

    if (limitState.plan === 'credits_49' && !hasActiveSubscription(req.user)) {
      req.user.chatCredits = Math.max((req.user.chatCredits || 0) - 1, 0);
      await req.user.save();
    }

    return res.json({
      chat,
      limitState: getChatLimitState(req.user, chat)
    });
  });
}

export async function downloadReport(req, res) {
  const chat = await Chat.findOne({ _id: req.params.chatId, userId: req.user.id });
  if (!chat) {
    return res.status(404).json({ message: 'Chat not found' });
  }

  if (!hasActiveSubscription(req.user)) {
    return res.status(403).json({ message: 'PDF download is available for the Rs. 299 subscription plan only' });
  }

  const pdfBuffer = await renderReportPdf({ user: req.user, chat });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="astroai-report-${chat.id}.pdf"`);
  res.send(pdfBuffer);
}
