/**
 * Sentiment Poll: daily Bullish/Bearish crowd vote on BTC's 24h direction.
 * Separate from the algorithmic FGI score — a "crowd vs. index" comparison.
 *
 * KV keys:
 *   poll:{date}:bullish / poll:{date}:bearish  — daily vote counters
 *   vote:{date}:{deviceId}                     — a visitor's vote for that day (48h TTL)
 */

const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;
const VOTE_TTL_SECONDS = 60 * 60 * 48; // 48h — well past the day the vote belongs to

function todayUTC() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

async function kvGet(key) {
  const r = await fetch(`${KV_REST_API_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
  });
  if (!r.ok) throw new Error(`KV GET ${key} failed: ${r.status}`);
  const data = await r.json();
  return data.result;
}

// The KV REST API stores whatever was POSTed as the raw body and returns it
// verbatim on GET — JSON.stringify'd values come back as JSON *strings*, not
// auto-parsed objects. Callers that stored an object must parse it back.
async function kvGetJSON(key) {
  const raw = await kvGet(key);
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

async function kvSetWithExpiry(key, value, ttlSeconds) {
  const r = await fetch(`${KV_REST_API_URL}/set/${key}?EX=${ttlSeconds}`, {
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
    method: 'POST',
    body: JSON.stringify(value),
  });
  if (!r.ok) throw new Error(`KV SET ${key} failed: ${r.status}`);
}

async function kvIncr(key) {
  const r = await fetch(`${KV_REST_API_URL}/incr/${key}`, {
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
    method: 'POST',
  });
  if (!r.ok) throw new Error(`KV INCR ${key} failed: ${r.status}`);
  const data = await r.json();
  return data.result;
}

async function kvDecr(key) {
  const r = await fetch(`${KV_REST_API_URL}/decr/${key}`, {
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
    method: 'POST',
  });
  if (!r.ok) throw new Error(`KV DECR ${key} failed: ${r.status}`);
}

async function getCounts(date) {
  const [bullishRaw, bearishRaw] = await Promise.all([
    kvGet(`poll:${date}:bullish`),
    kvGet(`poll:${date}:bearish`),
  ]);
  const bullish = parseInt(bullishRaw, 10) || 0;
  const bearish = parseInt(bearishRaw, 10) || 0;
  return { bullish, bearish, total: bullish + bearish };
}

export default async function handler(req, res) {
  const date = todayUTC();

  if (req.method === 'GET') {
    try {
      const counts = await getCounts(date);
      return res.status(200).json({ date, ...counts });
    } catch (error) {
      console.error('Poll GET error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { vote, deviceId } = req.body || {};
      if (vote !== 'bullish' && vote !== 'bearish') {
        return res.status(400).json({ error: 'vote must be "bullish" or "bearish"' });
      }
      if (typeof deviceId !== 'string' || deviceId.trim().length === 0) {
        return res.status(400).json({ error: 'deviceId is required' });
      }

      const voteKey = `vote:${date}:${deviceId}`;
      const priorRecord = await kvGetJSON(voteKey);
      const priorVote = priorRecord ? priorRecord.vote : null;

      if (priorVote === vote) {
        // Same vote resubmitted — no-op, just return current counts
        const counts = await getCounts(date);
        return res.status(200).json({ date, ...counts, changed: false });
      }

      if (priorVote === 'bullish' || priorVote === 'bearish') {
        // Changing their vote — move the count instead of double-counting
        await kvDecr(`poll:${date}:${priorVote}`);
      }

      await kvIncr(`poll:${date}:${vote}`);
      await kvSetWithExpiry(voteKey, { vote }, VOTE_TTL_SECONDS);

      const counts = await getCounts(date);
      return res.status(200).json({ date, ...counts, changed: true, vote });
    } catch (error) {
      console.error('Poll POST error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
