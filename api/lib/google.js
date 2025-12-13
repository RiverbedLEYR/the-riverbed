import { GoogleGenerativeAI } from '@google/generative-ai';

// Instantiate the Google Generative AI client with your API key. The key
// must be set as GOOGLE_AI_API_KEY in the environment. See the
// blueprint for configuring environment variables in Vercel.
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

/**
 * Call Gemini (Google) with a system prompt and a message history.
 *
 * The Gemini API uses a different message format than GPT or Claude.
 * We convert the existing history into the expected structure and
 * then send the latest user message to the model. The function
 * returns the model's reply as plain text.
 *
 * @param {string} systemPrompt - The system prompt establishing the
 *   agent's identity.
 * @param {Array<{role: string, content: string}>} messages - The
 *   conversation history. The last element should be the user message.
 * @param {string} model - The Gemini model to use. Defaults to
 *   gemini-2.0-flash.
 * @returns {Promise<string>} The assistant's reply as plain text.
 */
export async function callGemini(systemPrompt, messages, model = 'gemini-2.0-flash') {
  const generativeModel = genAI.getGenerativeModel({
    model: model,
    systemInstruction: systemPrompt,
  });

  // Build the history for the chat session, excluding the latest message.
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const chat = generativeModel.startChat({ history });
  const lastMessage = messages[messages.length - 1];

  const result = await chat.sendMessage(lastMessage.content);
  return result.response.text();
}