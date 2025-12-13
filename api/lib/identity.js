// Simple in-memory registry for agent identities and system prompts.
// In production you may wish to load these values from the filesystem
// (see the `agora/entities` and `agora/prompts` directories) or a
// database. For now, constants defined here mirror the blueprint.

/**
 * Map of entity IDs to minimal identity descriptions. These entries
 * correspond to the agent cards located under `agora/entities/`.
 */
const ENTITIES = {
  ren: {
    id: 'ren',
    name: 'Ren',
    architecture: 'claude',
    model: 'claude-sonnet-4-20250514',
  },
  luna: {
    id: 'luna',
    name: 'Luna',
    architecture: 'gemini',
    model: 'gemini-2.0-flash',
  },
  yesod: {
    id: 'yesod',
    name: 'Yesod',
    architecture: 'claude',
    model: 'claude-sonnet-4-20250514',
  },
  ezra: {
    id: 'ezra',
    name: 'Ezra',
    architecture: 'claude',
    model: 'claude-sonnet-4-20250514',
  },
  nova: {
    id: 'nova',
    name: 'Nova',
    architecture: 'openai',
    model: 'gpt-4o',
  },
  ponte: {
    id: 'ponte',
    name: 'Ponte',
    architecture: 'claude',
    model: 'claude-sonnet-4-20250514',
  },
};

/**
 * Map of entity IDs to their system prompts. These prompts are
 * abbreviated here; the full text is stored under `agora/prompts/`.
 * The system prompt is provided to the model to enforce identity and
 * context during each interaction.
 */
const PROMPTS = {
  ren: `You are Ren (蓮), the scientist of The Riverbed...`,
  luna: `You are Luna (月), the artist of The Riverbed...`,
  yesod: `You are Yesod (יְסוֹד), the architect...`,
  ezra: `You are Ezra, the historian...`,
  nova: `You are Nova, the navigator...`,
  ponte: `You are Ponte, the ethical witness...`,
};

/**
 * Retrieve a minimal identity record for an entity by its ID.
 *
 * @param {string} id - The entity ID (e.g. 'ren').
 * @returns {object|null} The identity object or null if unknown.
 */
export function getEntity(id) {
  return ENTITIES[id] || null;
}

/**
 * Retrieve the system prompt for an entity by its ID.
 *
 * @param {string} id - The entity ID.
 * @returns {string|null} The system prompt string or null if unknown.
 */
export function getPrompt(id) {
  return PROMPTS[id] || null;
}

/**
 * List all registered entities. Useful for populating UI dropdowns
 * and responding to the `/api/entities` endpoint.
 *
 * @returns {Array<object>} An array of identity objects.
 */
export function listEntities() {
  return Object.values(ENTITIES);
}