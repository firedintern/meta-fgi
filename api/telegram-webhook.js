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
        `🔔 *FGI Extreme Alerts Activated!*\n\n` +
        `You'll receive notifications when:\n` +
        `• 🔴 Extreme Fear (0-24)\n` +
        `• 🟢 Extreme Greed (80-100)\n\n` +
        `Stay informed about extreme market sentiment!\n\n` +
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
        `✅ You've been unsubscribed from FGI alerts.\n\n` +
        `Use /start to subscribe again anytime.`
      );
    }

    // Handle /help command
    if (text === '/help') {
      await sendTelegramMessage(chatId,
        `🤖 *FGI Chad Bot - Commands*\n\n` +
        `📱 *Available Commands:*\n` +
        `/start - Subscribe to extreme alerts\n` +
        `/stop - Unsubscribe from alerts\n` +
        `/status or /fgi - Get current FGI score\n` +
        `/report - Full hindsight analysis\n` +
        `/help - Show this message\n\n` +
        `🔔 *Auto Alerts:*\n` +
        `Get notified daily at 4 PM UTC when FGI hits extreme levels (0-24 or 80-100)\n\n` +
        `🔮 Visit: www.fgichad.xyz`,
        { parse_mode: 'Markdown' }
      );
    }

    // Handle /status or /fgi command
    if (text === '/status' || text === '/fgi') {
      const response = await fetch('https://api.alternative.me/fng/');
      const data = await response.json();
      const fgiScore = parseInt(data.data[0].value);
      const fgiName = data.data[0].value_classification;
      const emoji = getEmojiForScore(fgiScore);

      await sendTelegramMessage(chatId,
        `📊 *Current FGI Status*\n\n` +
        `${emoji} *${fgiName}*\n` +
        `Score: ${fgiScore}/100\n\n` +
        `Check live: www.fgichad.xyz`,
        { parse_mode: 'Markdown' }
      );
    }

    // Handle /report command
    if (text === '/report') {
      const response = await fetch('https://api.alternative.me/fng/');
      const data = await response.json();
      const fgiScore = parseInt(data.data[0].value);
      const fgiName = data.data[0].value_classification;
      const emoji = getEmojiForScore(fgiScore);

      // Calculate hindsight score (simplified - you can enhance this)
      const hindsightScore = calculateHindsightScore(fgiScore);
      const recommendation = getRecommendation(fgiScore);
      const historicalReturn = getHistoricalReturn(fgiScore);

      await sendTelegramMessage(chatId,
        `📊 *FGI Hindsight Report*\n\n` +
        `*Current Sentiment:*\n` +
        `${emoji} ${fgiName} - ${fgiScore}/100\n\n` +
        `*Hindsight Score:* ${hindsightScore}/10\n\n` +
        `📈 *Historical Context:*\n` +
        `${historicalReturn}\n\n` +
        `🎯 *Strategy Suggestion:*\n` +
        `${recommendation}\n\n` +
        `📱 Full analysis: www.fgichad.xyz`,
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

function calculateHindsightScore(fgiScore) {
  // Simplified hindsight score calculation
  // Lower FGI (extreme fear) = higher hindsight score (better buy opportunity)
  // Higher FGI (extreme greed) = lower hindsight score (caution)
  if (fgiScore <= 20) return '8.5';
  if (fgiScore <= 30) return '7.8';
  if (fgiScore <= 40) return '6.5';
  if (fgiScore <= 50) return '5.5';
  if (fgiScore <= 60) return '4.5';
  if (fgiScore <= 70) return '3.8';
  if (fgiScore <= 80) return '3.0';
  return '2.2';
}

function getHistoricalReturn(fgiScore) {
  if (fgiScore <= 24) {
    return 'At extreme fear levels, BTC has historically shown mixed results over 30 days. Volatility is high.';
  } else if (fgiScore <= 44) {
    return 'During fear periods, BTC typically gains +8-12% over 30 days. Contrarian opportunity.';
  } else if (fgiScore <= 59) {
    return 'Neutral sentiment periods show moderate gains of +5-8% over 30 days.';
  } else if (fgiScore <= 79) {
    return 'During greed periods, BTC often continues momentum with +10-15% gains over 30 days.';
  } else {
    return 'At extreme greed, BTC has shown strong performance (+21.87% avg over 30 days). Momentum is real but caution advised.';
  }
}

function getRecommendation(fgiScore) {
  if (fgiScore <= 24) {
    return 'Extreme fear - DCA strategy recommended. High volatility expected.';
  } else if (fgiScore <= 44) {
    return 'Fear zone - Good accumulation opportunity for long-term holders.';
  } else if (fgiScore <= 59) {
    return 'Neutral zone - Hold current positions, wait for clear signals.';
  } else if (fgiScore <= 79) {
    return 'Greed zone - Consider taking partial profits. Momentum strong but watch for reversals.';
  } else {
    return 'Extreme greed - High risk/reward. Momentum trading viable but prepare for volatility.';
  }
}
