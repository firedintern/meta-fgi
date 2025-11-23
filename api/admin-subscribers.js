/**
 * Admin Endpoint: View Telegram Bot Subscribers
 * GET /api/admin-subscribers?secret=YOUR_ADMIN_SECRET
 * Returns subscriber count and list
 */

const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'change-me-in-vercel';

export default async function handler(req, res) {
  // Verify admin secret
  const secret = req.query.secret || req.headers['x-admin-secret'];

  if (secret !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized - Invalid admin secret' });
  }

  try {
    // Get all subscribers from KV
    const subscribers = await getAllSubscribers();

    return res.status(200).json({
      success: true,
      total_subscribers: subscribers.length,
      subscribers: subscribers,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin error:', error);
    return res.status(500).json({
      error: 'Failed to fetch subscribers',
      details: error.message
    });
  }
}

async function getAllSubscribers() {
  try {
    // Scan all keys starting with "subscriber:"
    const response = await fetch(`${KV_REST_API_URL}/keys/subscriber:*`, {
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error('KV scan failed:', response.status);
      return [];
    }

    const data = await response.json();
    const keys = data.result || [];

    // Get detailed info for each subscriber
    const subscribers = [];
    for (const key of keys) {
      const chatId = key.replace('subscriber:', '');

      // Fetch subscriber data
      const subResponse = await fetch(`${KV_REST_API_URL}/get/${key}`, {
        headers: {
          Authorization: `Bearer ${KV_REST_API_TOKEN}`,
        },
      });

      if (subResponse.ok) {
        const subData = await subResponse.json();
        subscribers.push({
          chat_id: chatId,
          subscribed_at: subData.result?.subscribedAt || 'Unknown',
          telegram_link: `https://t.me/${chatId}`
        });
      } else {
        // If we can't get details, just add the chat ID
        subscribers.push({
          chat_id: chatId,
          subscribed_at: 'Unknown',
          telegram_link: `https://t.me/${chatId}`
        });
      }
    }

    return subscribers;

  } catch (error) {
    console.error('Error getting subscribers:', error);
    return [];
  }
}
