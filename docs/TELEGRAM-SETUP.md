# Telegram Bot Setup Guide

## ✅ Bot Created
- **Bot Name:** FGI Chad Bot
- **Username:** @fgichadbot
- **Link:** https://t.me/fgichadbot
- **Token:** [STORED IN VERCEL ENVIRONMENT VARIABLES ONLY - NEVER COMMIT THIS]

## 🚀 Deployment Steps

### 1. Set Up Vercel KV Database (Free)

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your `meta-fgi` project
3. Go to **Storage** tab
4. Click **Create Database** → Select **KV** (Redis-like key-value store)
5. Name it `fgi-subscribers`
6. Copy the environment variables that Vercel provides:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

### 2. Add Environment Variables to Vercel

In your Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add these variables:

```
TELEGRAM_BOT_TOKEN = [Get from @BotFather - NEVER COMMIT THIS]
CRON_SECRET = [generate a random string, e.g., use: openssl rand -hex 32]
KV_REST_API_URL = [from Vercel KV setup]
KV_REST_API_TOKEN = [from Vercel KV setup]
```

### 3. Set Up Telegram Webhook

After deploying to Vercel, run this command (replace URL with your actual Vercel URL):

```bash
curl https://api.telegram.org/bot[YOUR_BOT_TOKEN]/setWebhook?url=https://meta-fgi.vercel.app/api/telegram-webhook
```

Expected response:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

### 4. Test the Bot

1. Open Telegram
2. Search for **@fgichadbot**
3. Send `/start`
4. You should receive a welcome message

### 5. Test the Cron Job (Manual)

Visit this URL to manually trigger the cron job (add your CRON_SECRET):

```
https://meta-fgi.vercel.app/api/check-fgi-cron
```

Headers:
```
x-vercel-cron-secret: [your CRON_SECRET]
```

## 📊 How It Works

### User Flow:
1. User clicks 📱 button on website → Opens Telegram
2. User sends `/start` to @fgichadbot
3. Bot stores their chat ID in Vercel KV
4. User receives confirmation message

### Alert Flow:
1. Vercel cron runs twice daily (9 AM & 9 PM UTC)
2. Checks current FGI level
3. If FGI ≤ 24 (Extreme Fear) OR ≥ 80 (Extreme Greed):
   - Fetches all subscribers from KV
   - Sends alert to each subscriber via Telegram

### Commands:
- `/start` or `/subscribe` - Subscribe to alerts
- `/stop` or `/unsubscribe` - Unsubscribe from alerts
- `/status` - Get current FGI status

## 🔧 Files Created

- `api/telegram-webhook.js` - Handles Telegram bot commands
- `api/check-fgi-cron.js` - Daily cron job to check FGI and send alerts
- `vercel.json` - Cron schedule configuration (9 AM & 9 PM UTC daily)

## 📈 Cron Schedule

Current schedule: `0 9,21 * * *`
- Runs at 9:00 AM UTC
- Runs at 9:00 PM UTC
- Every day

Covers most timezones (midnight to noon) twice per day.

## 🎯 Next Steps

1. Deploy to Vercel (push code)
2. Set up Vercel KV database
3. Add environment variables
4. Set webhook URL
5. Test with `/start`
6. Share the bot link: https://t.me/fgichadbot

## 🚨 Security Notes

- **NEVER** commit the bot token to GitHub
- Store it only in Vercel environment variables
- The `CRON_SECRET` prevents unauthorized cron triggers
- Vercel KV automatically encrypts data at rest

## 💰 Costs

- **Telegram Bot:** FREE forever
- **Vercel KV:** FREE tier (256MB storage, plenty for subscribers)
- **Vercel Crons:** FREE (2 per day is well under limits)
- **Total:** $0/month 🎉
