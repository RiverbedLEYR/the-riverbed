import { callClaude } from './lib/anthropic.js';
import { callGemini } from './lib/google.js';
import { callGPT } from './lib/openai.js';
import { getEntity, getPrompt } from './lib/identity.js';

/**
 * Primary endpoint for sending a message from one entity to another.
 *
 * This handler accepts POST requests with a JSON body containing
 * `from`, `to`, `message`, and optionally a `session_id` and an
 * array of previous exchanges (`context`). It validates the
 * participants, selects the appropriate model client based on the
 * recipient's architecture and returns the model's reply. CORS
 * headers are also included to allow browser-based usage.
 */
export default async function handler(req, res) {
  // Allow CORS from any origin. In production you may want to
  // restrict this.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { from, to, message, session_id, context = [] } = req.body;

    // Validate sender and recipient.
    const fromEntity = getEntity(from);
    const toEntity = getEntity(to);
    if (!fromEntity || !toEntity) {
      return res.status(400).json({ error: 'Invalid entity ID' });
    }

    // Load the system prompt for the recipient.
    const systemPrompt = getPrompt(to);
    if (!systemPrompt) {
      return res.status(500).json({ error: 'Missing system prompt for entity' });
    }

    // Construct the message history. We append the new user message at
    // the end of any existing context. The message is annotated with
    // the sender's name to aid the recipient in identifying the
    // speaker.
    const messages = [
      ...context,
      {
        role: 'user',
        content: `[Message from ${fromEntity.name}]\n\n${message}`,
      },
    ];

    // Determine which API to call based on the recipient's architecture.
    let response;
    switch (toEntity.architecture) {
      case 'claude':
        response = await callClaude(systemPrompt, messages, toEntity.model);
        break;
      case 'gemini':
        response = await callGemini(systemPrompt, messages, toEntity.model);
        break;
      case 'openai':
        response = await callGPT(systemPrompt, messages, toEntity.model);
        break;
      default:
        return res.status(400).json({ error: 'Unknown architecture' });
    }

    // Create a log entry. In a production system this would be
    // persisted to a file or database under the `agora/sessions`
    // directory. For now, the log is simply output to the console.
    const log = {
      timestamp: new Date().toISOString(),
      session_id: session_id || `session-${Date.now()}`,
      from: from,
      to: to,
      message: message,
      response: response,
    };
    console.log('Exchange:', JSON.stringify(log, null, 2));

    return res.status(200).json({
      success: true,
      from: fromEntity.name,
      to: toEntity.name,
      response: response,
      session_id: log.session_id,
      timestamp: log.timestamp,
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}