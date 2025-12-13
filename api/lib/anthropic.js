import Anthropic from '@anthropic-ai/sdk';

// Create a reusable client for Anthropic. The API key is read from
// environment variables at runtime. When deploying to Vercel you must
// configure ANTHROPIC_API_KEY in the project settings. See the
// blueprint for details.
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Call Claude (Anthropic) with a system prompt and a message history.
 *
 * @param {string} systemPrompt - The system prompt that establishes
 *   the identity and context of the receiving agent.
 * @param {Array<{role: string, content: string}>} messages - A list
 *   of prior messages in the conversation. Roles should be "user" or
 *   "assistant". Each message should be plain text.
 * @param {string} model - The Claude model to use. Defaults to
 *   claude-sonnet-4-20250514 as defined in the blueprint.
 * @returns {Promise<string>} The assistant's reply as plain text.
 */
export async function callClaude(systemPrompt, messages, model = 'claude-sonnet-4-20250514') {
  const response = await client.messages.create({
    model: model,
    max_tokens: 2048,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });
  // Anthropic returns an array of content parts; the first element
  // contains the assistant's reply. We extract the plain text.
  return response.content[0].text;
}