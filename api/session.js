// In-memory store for conversation sessions. When running in a
// serverless environment such as Vercel, this map is not persisted
// between function invocations. For a production deployment you
// should replace this with Redis or another persistent store.
const sessions = new Map();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { session_id } = req.query;

  if (req.method === 'GET') {
    // Retrieve session history by ID.
    const session = sessions.get(session_id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    return res.status(200).json(session);
  }

  if (req.method === 'POST') {
    // Create or update a session. Accepts participants and exchanges
    // as arrays. If no session_id is provided a new session ID is
    // generated.
    const { participants, exchanges } = req.body;
    const id = session_id || `session-${Date.now()}`;
    const session = {
      id: id,
      created: new Date().toISOString(),
      participants: participants || [],
      exchanges: exchanges || [],
    };
    sessions.set(id, session);
    return res.status(200).json(session);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}