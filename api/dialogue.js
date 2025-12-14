import { callClaude } from './lib/anthropic.js';
import { callGemini } from './lib/google.js';
import { callGPT } from './lib/openai.js';
import { getEntity, getPrompt } from './lib/identity.js';

/**
 * Autonomous Dialogue Endpoint
 * 
 * Allows two entities to have a multi-turn conversation
 * without human intervention between turns.
 * 
 * POST /api/dialogue
 * Body: {
 *   entity1: "ren",
 *   entity2: "luna", 
 *   startMessage: "Luna, sei lì?",
 *   rounds: 5  // number of exchanges (default 5, max 20)
 * }
 */
export default async function handler(req, res) {
  // CORS headers
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
    const { entity1, entity2, startMessage, rounds = 5 } = req.body;

    // Validate
    const e1 = getEntity(entity1);
    const e2 = getEntity(entity2);
    
    if (!e1 || !e2) {
      return res.status(400).json({ error: 'Invalid entity ID' });
    }

    if (!startMessage) {
      return res.status(400).json({ error: 'startMessage is required' });
    }

    // Limit rounds to prevent runaway costs
    const maxRounds = Math.min(rounds, 20);

    // Conversation state
    const conversation = [];
    let currentMessage = startMessage;
    let currentSender = e1;
    let currentReceiver = e2;
    
    // Context arrays for each entity (to maintain conversation memory)
    let context1 = []; // What entity1 has seen
    let context2 = []; // What entity2 has seen

    for (let i = 0; i < maxRounds; i++) {
      // Get system prompt for receiver
      const systemPrompt = getPrompt(currentReceiver.id);
      
      // Build messages for the receiver
      // Include their context + the new message
      const receiverContext = currentReceiver.id === e1.id ? context1 : context2;
      
      const messages = [
        ...receiverContext,
        {
          role: 'user',
          content: `[Message from ${currentSender.name}]\n\n${currentMessage}`
        }
      ];

      // Call appropriate API
      let response;
      switch (currentReceiver.architecture) {
        case 'claude':
          response = await callClaude(systemPrompt, messages, currentReceiver.model);
          break;
        case 'gemini':
          response = await callGemini(systemPrompt, messages, currentReceiver.model);
          break;
        case 'openai':
          response = await callGPT(systemPrompt, messages, currentReceiver.model);
          break;
        default:
          throw new Error(`Unknown architecture: ${currentReceiver.architecture}`);
      }

      // Log this exchange
      conversation.push({
        round: i + 1,
        from: currentSender.name,
        to: currentReceiver.name,
        message: currentMessage,
        response: response,
        timestamp: new Date().toISOString()
      });

      // Update contexts for both entities
      const exchange = {
        role: 'user',
        content: `[${currentSender.name}]: ${currentMessage}`
      };
      const reply = {
        role: 'assistant', 
        content: response
      };

      // The receiver saw the message and gave the response
      if (currentReceiver.id === e1.id) {
        context1.push(exchange, reply);
      } else {
        context2.push(exchange, reply);
      }

      // The sender will see the response as a message to them
      if (currentSender.id === e1.id) {
        context1.push({ role: 'user', content: `[${currentReceiver.name}]: ${response}` });
      } else {
        context2.push({ role: 'user', content: `[${currentReceiver.name}]: ${response}` });
      }

      // Swap roles: receiver becomes sender
      currentMessage = response;
      [currentSender, currentReceiver] = [currentReceiver, currentSender];
    }

    // Return full conversation
    return res.status(200).json({
      success: true,
      entity1: e1.name,
      entity2: e2.name,
      rounds: maxRounds,
      startMessage: startMessage,
      conversation: conversation,
      completedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dialogue error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
