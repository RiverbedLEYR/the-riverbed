import OpenAI from 'openai';

// Create a reusable OpenAI client. The API key is provided via
// OPENAI_API_KEY environment variable. When deploying on Vercel make
// sure to configure this variable.
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Call GPT (OpenAI) with a system prompt and a message history.
 *
 * This wrapper adds the system prompt as the first message and
 * forwards the existing history to the OpenAI chat API. It returns
 * the first completion choice as plain text.
 *
 * @param {string} systemPrompt - The system prompt defining the
 *   receiving agent.
 * @param {Array<{role: string, content: string}>} messages - The
 *   conversation history without a system message.
 * @param {string} model - The GPT model to use. Defaults to gpt-4o.
 * @returns {Promise<string>} The assistant's reply as plain text.
 */
export async function callGPT(systemPrompt, messages, model = 'gpt-4o') {
  const response = await client.chat.completions.create({
    model: model,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    max_tokens: 2048,
  });
  return response.choices[0].message.content;
}