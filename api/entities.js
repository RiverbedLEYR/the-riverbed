import { listEntities } from './lib/identity.js';

/**
 * Endpoint to list all available entities. Returns a JSON payload
 * containing an array of identity records. Only GET is allowed.
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const entities = listEntities();
  return res.status(200).json({ entities });
}