/**
 * Telegram Webhook Handler
 * Receives updates from Telegram when users interact with the bot
 */

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(200).json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text;

    // Handle /start command
    if (text === '/start' || text === '/subscribe') {
      // Store subscriber in Vercel KV
      await fetch(`${KV_REST_API_URL}/set/subscriber:${chatId}`, {
        headers: {
          Authorization: `Bearer ${KV_REST_API_TOKEN}`,
        },
        method: 'POST',
        body: JSON.stringify({ chatId, subscribedAt: new Date().toISOString() }),
      });

      // Send welcome message
      await sendTelegramMessage(chatId,
        `🔔 *FGI Extreme Alerts Activated!*\\n\\n` +
        `You'll receive notifications when:\\n` +
        `• 🔴 Extreme Fear (0-24)\\n` +
        `• 🟢 Extreme Greed (80-100)\\n\\n` +
        `Stay informed about extreme market sentiment!\\n\\n` +
        `Use /stop to unsubscribe anytime.`,
        { parse_mode: 'Markdown' }
      );
    }

    // Handle /stop command
    if (text === '/stop' || text === '/unsubscribe') {
      // Remove subscriber from KV
      await fetch(`${KV_REST_API_URL}/del/subscriber:${chatId}`, {
        headers: {
          Authorization: `Bearer ${KV_REST_API_TOKEN}`,
        },
        method: 'POST',
      });

      await sendTelegramMessage(chatId,
        `✅ You've been unsubscribed from FGI alerts.\\n\\n` +
        `Use /start to subscribe again anytime.`
      );
    }

    // Handle /status command
    if (text === '/status') {
      const response = await fetch('https://api.alternative.me/fng/');
      const data = await response.json();
      const fgiScore = parseInt(data.data[0].value);
      const fgiName = data.data[0].value_classification;
      const emoji = getEmojiForScore(fgiScore);

      await sendTelegramMessage(chatId,
        `📊 *Current FGI Status*\\n\\n` +
        `${emoji} *${fgiName}*\\n` +
        `Score: ${fgiScore}/100\\n\\n` +
        `Check live: https://meta-fgi.vercel.app`,
        { parse_mode: 'Markdown' }
      );
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(200).json({ ok: true }); // Always return 200 to Telegram
  }
}

async function sendTelegramMessage(chatId, text, options = {}) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      ...options,
    }),
  });
}

function getEmojiForScore(score) {
  if (score <= 24) return '💀';
  if (score <= 44) return '😨';
  if (score <= 59) return '😐';
  if (score <= 79) return '🤑';
  return '🚀';
}
