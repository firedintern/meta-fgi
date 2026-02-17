# Fear & Greed Protocol — Project Instructions

## Project Overview

A production crypto Fear & Greed Index dashboard with casino-style visualization, portfolio management, Telegram bot alerts, and historical backtesting analysis.

- **Live site**: https://www.fgichad.xyz
- **Deployment**: Vercel (serverless functions + cron jobs)
- **Tech stack**: Vanilla JS (ES6+), HTML5, CSS3, Chart.js, Web Audio API, Node.js APIs

## Repository Structure

```
├── index.html              # Production website (DO NOT break this)
├── api/                    # Vercel serverless functions (production)
│   ├── fgi.js              # FGI proxy API
│   ├── telegram-webhook.js # Telegram bot webhook
│   ├── check-fgi-cron.js   # Daily cron for alerts
│   └── admin-subscribers.js# Admin subscriber endpoint
├── vercel.json             # Vercel cron config (production)
├── scripts/                # Utility & data processing scripts
├── data/                   # Backtest results and cached data
├── drafts/                 # Experimental HTML versions (not production)
├── docs/                   # Project documentation
├── .claude/
│   ├── commands/           # Custom slash commands (skills)
│   └── agents/             # Subagent definitions
└── claude-code-workflows-main/  # Reference workflow templates
```

## Critical Rules

1. **Never modify `index.html`, `api/`, or `vercel.json` without explicit approval** — these are live production files
2. **Never commit secrets** — all tokens/keys live in Vercel environment variables only
3. **FGI thresholds**: Extreme Fear ≤24, Fear 25-44, Neutral 45-59, Greed 60-79, Extreme Greed ≥80

## External APIs

| API | Purpose | Endpoint | Cost |
|-----|---------|----------|------|
| Alternative.me | Fear & Greed Index | `https://api.alternative.me/fng/` | Free |
| CryptoCompare | BTC price history | `https://min-api.cryptocompare.com/data/v2/histoday` | Free (100k/mo) |
| CoinGecko | Real-time BTC price | `https://api.coingecko.com/api/v3/` | Free |

## Environment Variables (Vercel only — never commit)

- `TELEGRAM_BOT_TOKEN` — from @BotFather
- `KV_REST_API_URL` — Vercel KV database
- `KV_REST_API_TOKEN` — Vercel KV auth
- `CRON_SECRET` — protects manual cron triggers
- `ADMIN_SECRET` — protects admin endpoints

## Design Review

When making front-end changes:
1. Follow the design principles in `claude-code-workflows-main/design-review/design-principles-example.md`
2. Use the `/design-review` slash command for comprehensive UI review
3. Test responsiveness at desktop (1440px), tablet (768px), and mobile (375px)

## Running Locally

```bash
npm install        # Only dependency is axios (for scripts)
open index.html    # No build step — vanilla JS
```

## Running Backtest

```bash
node scripts/backtest-hindsight-score.js
```
