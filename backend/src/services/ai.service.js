const OpenAI = require('openai');

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

exports.chatAssistant = async (message, context) => {
  if (!openai) {
    return 'AI service is not configured. Please set OPENAI_API_KEY.';
  }

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
};

exports.sentimentFromText = async (text) => {
  if (!openai) {
    const lower = text.toLowerCase();
    if (lower.includes('bad') || lower.includes('worst') || lower.includes('poor')) return 'negative';
    if (lower.includes('good') || lower.includes('excellent') || lower.includes('great')) return 'positive';
    return 'neutral';
  }

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
};
