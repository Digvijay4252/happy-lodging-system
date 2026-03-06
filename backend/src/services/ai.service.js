const OpenAI = require('openai');

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const AI_PROVIDER = (process.env.AI_PROVIDER || '').toLowerCase();
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';

function getProvider() {
  if (AI_PROVIDER) return AI_PROVIDER;
  if (openai) return 'openai';
  return 'mock';
}

async function chatWithOllama(message, context) {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      messages: [
        {
          role: 'system',
          content:
            'You are a hotel assistant. Answer FAQs, help with room finding and booking guidance in concise steps.',
        },
        {
          role: 'user',
          content: `Context: ${JSON.stringify(context || {})}\nQuestion: ${message}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Ollama error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return data?.message?.content?.trim() || 'No response generated';
}

function mockChat(message, context) {
  const lower = String(message || '').toLowerCase();
  const rooms = context?.availableRooms || [];

  if (lower.includes('available') || lower.includes('room')) {
    if (!rooms.length) return 'No available rooms found currently. Try adjusting dates or budget.';
    const lines = rooms
      .slice(0, 3)
      .map((r) => `Room #${r.room_number} (${r.type}) - ${r.price}/night`)
      .join('; ');
    return `Here are top available options: ${lines}.`;
  }

  if (lower.includes('book')) {
    return 'To book: choose room, set check-in/check-out dates, confirm booking popup, then complete payment.';
  }

  if (lower.includes('cancel')) {
    return 'You can cancel from My Bookings before check-in date. After cancellation, room availability is updated automatically.';
  }

  return 'I can help with room search, booking flow, payments, and cancellation rules. Tell me your dates and budget.';
}

async function sentimentFromOllama(text) {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      messages: [
        { role: 'system', content: 'Classify sentiment strictly as positive, neutral, or negative.' },
        { role: 'user', content: text },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Ollama error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return data?.message?.content?.trim()?.toLowerCase();
}

function basicSentiment(text) {
  const lower = String(text || '').toLowerCase();
  if (lower.includes('bad') || lower.includes('worst') || lower.includes('poor')) return 'negative';
  if (lower.includes('good') || lower.includes('excellent') || lower.includes('great')) return 'positive';
  return 'neutral';
}

exports.chatAssistant = async (message, context) => {
  const provider = getProvider();

  if (provider === 'ollama') {
    try {
      return await chatWithOllama(message, context);
    } catch (_error) {
      return mockChat(message, context);
    }
  }

  if (provider === 'openai') {
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a hotel assistant. Answer FAQs, help with room finding and booking guidance in concise steps.',
          },
          {
            role: 'user',
            content: `Context: ${JSON.stringify(context || {})}\nQuestion: ${message}`,
          },
        ],
        temperature: 0.4,
      });

      return completion.choices[0]?.message?.content || 'No response generated';
    } catch (_error) {
      return mockChat(message, context);
    }
  }

  return mockChat(message, context);
};

exports.sentimentFromText = async (text) => {
  const provider = getProvider();

  if (provider === 'ollama') {
    try {
      const result = await sentimentFromOllama(text);
      if (['positive', 'neutral', 'negative'].includes(result)) return result;
      return 'neutral';
    } catch (_error) {
      return basicSentiment(text);
    }
  }

  if (provider === 'openai') {
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Classify sentiment strictly as positive, neutral, or negative.' },
          { role: 'user', content: text },
        ],
        temperature: 0,
      });

      const result = completion.choices[0]?.message?.content?.trim()?.toLowerCase();
      if (['positive', 'neutral', 'negative'].includes(result)) return result;
      return 'neutral';
    } catch (_error) {
      return basicSentiment(text);
    }
  }

  return basicSentiment(text);
};

exports.getAiProviderStatus = () => ({
  provider: getProvider(),
  ollama: {
    baseUrl: OLLAMA_BASE_URL,
    model: OLLAMA_MODEL,
  },
});
