import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';

const client = env.geminiApiKey ? new GoogleGenerativeAI(env.geminiApiKey) : null;
const RETRYABLE_STATUS_CODES = new Set([429, 500, 503]);
const FALLBACK_MODELS = ['gemini-2.5-flash-lite', 'gemini-2.0-flash'];

function getModel(modelName = env.geminiModel) {
  if (!client) {
    throw new Error('GEMINI_API_KEY is missing');
  }

  return client.getGenerativeModel({ model: modelName });
}

function astrologyProfile(data) {
  return `Name: ${data.fullName}\nDate of birth: ${data.dob}\nBirth time (IST): ${data.time}\nBirth city: ${data.city}\nBirth state: ${data.state}\nBirth country: ${data.country}`;
}

function extractJson(text) {
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

function getStatusCode(error) {
  return error?.status || error?.statusCode || error?.response?.status || error?.cause?.status;
}

function isRetryableGeminiError(error) {
  return RETRYABLE_STATUS_CODES.has(getStatusCode(error));
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeReply(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function tryGenerateWithModel(modelName, prompt, { expectJson = false } = {}) {
  const model = getModel(modelName);
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return expectJson ? extractJson(text) : normalizeReply(text);
}

async function generateWithRetry(prompt, { expectJson = false } = {}) {
  const modelsToTry = [env.geminiModel, ...FALLBACK_MODELS.filter((model) => model !== env.geminiModel)];
  let lastError = null;

  for (const modelName of modelsToTry) {
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        return await tryGenerateWithModel(modelName, prompt, { expectJson });
      } catch (error) {
        lastError = error;

        if (attempt < maxAttempts && isRetryableGeminiError(error)) {
          await wait(600 * attempt);
          continue;
        }

        if (!isRetryableGeminiError(error)) {
          throw error;
        }

        break;
      }
    }
  }

  if (isRetryableGeminiError(lastError)) {
    const friendlyError = new Error('AstroAI is seeing unusually high Gemini demand right now. Please try sending the message again in a moment.');
    friendlyError.statusCode = 503;
    throw friendlyError;
  }

  throw lastError;
}

export async function generateInitialReport(astrologyData) {
  const prompt = `You are AstroAI, an expert Vedic astrology guide. Return only valid JSON with this exact shape: {"title":"string","subtitle":"string","overview":"string","corePersonality":{"summary":"string","tags":["string","string","string"]},"loveConnection":{"summary":"string","quote":"string","alertTitle":"string","alertBody":"string"},"careerAbundance":{"summary":"string","financialFlux":number},"healthRitual":{"summary":"string","rituals":["string","string","string"]},"celestialTimeline":[{"date":"string","title":"string","description":"string","energy":"string"},{"date":"string","title":"string","description":"string","energy":"string"}],"closingQuote":"string"}. Keep the tone premium and editorial.\n\n${astrologyProfile(astrologyData)}`;
  return generateWithRetry(prompt, { expectJson: true });
}

export async function generateChatReply(astrologyData, report, history, question) {
  const transcript = history.map((message) => `${message.role.toUpperCase()}: ${message.content}`).join('\n');
  const prompt = `You are AstroAI, an expert Vedic astrology assistant. Answer in very simple, easy-to-understand English. Keep the response short and clear: usually 3 to 6 sentences, or a very short list when helpful. Focus on the direct answer first, then one practical suggestion if relevant. Do not use markdown, bold text, asterisks, headings, or decorative formatting. Do not use JSON. Avoid long paragraphs, jargon, and repeated explanation.\n\nAstrology profile:\n${astrologyProfile(astrologyData)}\n\nExisting report JSON:\n${JSON.stringify(report)}\n\nConversation so far:\n${transcript}\n\nLatest question:\n${question}`;
  return generateWithRetry(prompt);
}

