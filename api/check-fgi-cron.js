/**
 * Cron Job: Check FGI and Send Alerts
 * Runs daily to check if FGI is at extreme levels
 * Sends Telegram notifications to all subscribers
 */

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

export default async function handler(req, res) {
  // Verify cron secret to prevent unauthorized calls
  const cronSecret = req.headers['x-vercel-cron-secret'];
  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Fetch current FGI
    const fgiResponse = await fetch('https://api.alternative.me/fng/');
    const fgiData = await fgiResponse.json();
    const fgiScore = parseInt(fgiData.data[0].value);
    const fgiName = fgiData.data[0].value_classification;

    console.log(`Current FGI: ${fgiScore} (${fgiName})`);

    // Check if extreme
    const isExtremeFear = fgiScore <= 24;
    const isExtremeGreed = fgiScore >= 80;

    if (!isExtremeFear && !isExtremeGreed) {
      console.log('Not at extreme levels, no alerts sent');
      return res.status(200).json({
        message: 'No alerts needed',
        score: fgiScore,
        name: fgiName
      });
    }

    // Get all subscribers from KV
    const subscribers = await getAllSubscribers();

    if (subscribers.length === 0) {
      console.log('No subscribers found');
      return res.status(200).json({
        message: 'No subscribers',
        score: fgiScore
      });
    }

    // Prepare alert message
    const emoji = isExtremeFear ? '🔴💀' : '🟢🚀';
    const level = isExtremeFear ? 'EXTREME FEAR' : 'EXTREME GREED';
    const advice = isExtremeFear
      ? 'Historical data shows mixed results at this level. Proceed with caution.'
      : 'Historical data shows strong performance (+21.87% avg over 30 days). Momentum is real!';

    const message =
      `${emoji} *${level} ALERT!* ${emoji}\\n\\n` +
      `📊 Current Score: *${fgiScore}/100*\\n` +
      `Status: ${fgiName}\\n\\n` +
      `💡 ${advice}\\n\\n` +
      `🔮 Check Hindsight Score: https://meta-fgi.vercel.app`;

    // Send to all subscribers
    let successCount = 0;
    let failCount = 0;

    for (const chatId of subscribers) {
      try {
        await sendTelegramMessage(chatId, message, { parse_mode: 'Markdown' });
        successCount++;
      } catch (error) {
        console.error(`Failed to send to ${chatId}:`, error);
        failCount++;
      }
    }

    console.log(`Alerts sent: ${successCount} success, ${failCount} failed`);

    return res.status(200).json({
      message: 'Alerts sent',
      score: fgiScore,
      level: fgiName,
      subscribers: subscribers.length,
      sent: successCount,
      failed: failCount
    });

  } catch (error) {
    console.error('Cron error:', error);
    return res.status(500).json({ error: error.message });
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

    // Extract chat IDs from keys (format: "subscriber:123456789")
    const chatIds = keys.map(key => key.replace('subscriber:', ''));
    return chatIds;

  } catch (error) {
    console.error('Error getting subscribers:', error);
    return [];
  }
}

async function sendTelegramMessage(chatId, text, options = {}) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      ...options,
    }),
  });

  if (!response.ok) {
    throw new Error(`Telegram API error: ${response.status}`);
  }

  return response.json();
}
