# Fear & Greed Protocol

> A real-time crypto Fear & Greed Index terminal: market sentiment, BTC metrics, portfolio management, Telegram alerts, and 5.5 years of backtested history, presented as a dark financial dashboard.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://www.fgichad.xyz)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Features

### Real-Time Market Data
- **Fear & Greed Index** - Live crypto market sentiment (0-100) with a five-band zone gauge, updated daily
- **Bitcoin Price Tracker** - Real-time BTC price with 24h change percentage
- **BTC Dominance & Market Cap** - Live global market share and total BTC market cap
- **30-Day Historical Chart** - Interactive Chart.js line chart with color-coded sentiment points
- **Sentiment Distribution Chart** - Donut chart showing how sentiment breaks down across the last 30 days
- **Manual Refresh** - One click updates FGI, BTC price, dominance, market cap, and both charts

### Dark Terminal Interface
- **FGI Hero** - Large tabular-mono score with a zone chip and change vs. yesterday
- **Five-Band Gauge** - Extreme Fear through Extreme Greed with a live position marker
- **Live UTC Clock** - Header clock showing the current time in UTC
- **Institutional Design System** - Square geometry, hairline-divided data strips, uppercase mono micro-labels, a single restrained accent color. Full spec in [`DESIGN.md`](DESIGN.md)

### Portfolio Management
- **Portfolio Tracker** - Input and save your crypto and stablecoin holdings
- **Smart Allocation Advice** - Recommendations based on Fear & Greed Index and your portfolio balance
- **Visual Portfolio Chart** - Interactive doughnut chart showing allocation breakdown
- **Persistent Storage** - Portfolio data saved locally in your browser

### Hindsight Score
- **Historical Analysis Modal** - Click **Hindsight** to open a full breakdown of how Bitcoin has performed after each FGI range
- **5.5-Year Dataset** - Based on 2,000 days of data (May 2020 - Nov 2025), covering multiple full market cycles
- **Three Time Horizons** - Forward returns at 7, 14, and 30 days for each sentiment range
- **Win Rate Stats** - Sample sizes, win rates, best/worst cases for each range
- **Live-Linked** - Auto-updates to reflect the current FGI score whenever you refresh

**Key finding (5.5-year data):**

| FGI Range | 30d Avg Return | Win Rate |
|-----------|---------------|----------|
| Extreme Fear (0-24) | -0.85% | 48.4% |
| Fear (25-44) | +4.54% | 56.8% |
| Neutral (45-59) | +6.82% | 59.6% |
| Greed (60-79) | +3.97% | 50.8% |
| Extreme Greed (80-100) | +21.87% | 74.8% |

### Historical Scenario Analysis
- **"What Would $1,000 Become?"** - Pick a sentiment band and hold period, see the historical outcome
- **Shareable Result Cards** - Generates a downloadable/shareable PNG summary of the scenario

### Strategy Backtester
- **Entry Timing Tool** - Compare returns based on which day of an Extreme Fear streak you enter
- **Exit Comparison** - Sell at Greed (FGI ≥60) vs. Extreme Greed (FGI ≥80)

### Sentiment Intelligence
- **Streak Tracking** - Consecutive days in the current sentiment category, with historical records and record dates
- **Market Signal** - Plain-language read on the current zone (e.g. "Historically an accumulation zone")
- **Sentiment Bands** - Five canonical ranges: Extreme Fear (≤24), Fear (25-44), Neutral (45-59), Greed (60-79), Extreme Greed (≥80)

### Telegram Bot Alerts
- **Bot**: [@fgichadbot](https://t.me/fgichadbot)
- **Subscribe** with `/start` to receive Telegram alerts at extreme FGI levels
- **Unsubscribe** with `/stop` at any time
- **Status check** with `/status` to get the current FGI score
- **Daily cron** checks FGI and sends alerts when it reaches extreme levels
- Subscriber data stored in Vercel KV (Redis-compatible key-value store)

### Sharing
- **Share on X** - One-click sharing of the current FGI reading with custom formatted text

### Fully Responsive & Accessible
- **Mobile-Optimized Layout** - Dedicated mobile footer navigation, touch-friendly sizing
- **Keyboard Navigation** - Full keyboard support with visible focus indicators
- **ARIA Labels** - Screen reader friendly with proper roles and states

## Live Demo

**[fgichad.xyz](https://www.fgichad.xyz)**

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3, split across `index.html` + `styles.css` + `app.js` (no build step)
- **Charts**: Chart.js 4.4.0 (Line, Doughnut, and Sentiment Distribution charts)
- **Storage**: LocalStorage API (portfolio persistence)
- **Bot Storage**: Vercel KV (Telegram subscriber list)
- **APIs**:
  - [Alternative.me Fear & Greed Index](https://alternative.me/crypto/fear-and-greed-index/) (current + 365-day history)
  - [CoinGecko API v3](https://www.coingecko.com/en/api) (real-time BTC price, 24h change, dominance, market cap)
  - [Binance public ticker/klines](https://binance-docs.github.io/apidocs/spot/en/) (BTC price fallback and history)
- **Deployment**: Vercel (serverless functions + daily cron)
- **Typography**: Inter (UI) + JetBrains Mono (all numerals and timestamps)
- **Accessibility**: ARIA labels, keyboard navigation support

## How to Use

### Basic Usage
1. Visit [fgichad.xyz](https://www.fgichad.xyz)
2. View the current Fear & Greed Index, zone, and market signal
3. Click **Refresh** to pull the latest data
4. Explore Hindsight, Backtester, and Portfolio from the header nav (or the mobile footer on small screens)

### Controls

| Button | Action |
|--------|--------|
| Hindsight | Open historical FGI performance analysis |
| Backtester | Open the entry-timing strategy backtester |
| Portfolio | Open portfolio management modal |
| Alerts | Subscribe to Telegram bot alerts |
| Refresh | Refresh all market data and charts |
| Share on X | Post current sentiment to X |

## Sentiment Guide

| Score | Zone | Signal |
|-------|------|--------|
| 0-24 | Extreme Fear | Historically an accumulation zone |
| 25-44 | Fear | Sentiment below the historical average |
| 45-59 | Neutral | No directional signal |
| 60-79 | Greed | Sentiment elevated above average |
| 80-100 | Extreme Greed | Historically a distribution zone |

## Using Portfolio Management

1. Click **Portfolio** in the header (or mobile footer)
2. Enter your holdings:
   - **Crypto Holdings ($)** - Your total crypto value (BTC, ETH, alts)
   - **Stablecoins ($)** - USDT, USDC, DAI, etc.
3. Click **Save Portfolio**
4. View your allocation breakdown chart and percentage split
5. Get advice based on the current Fear & Greed Index and your crypto/stablecoin ratio

Portfolio data is saved locally in your browser and persists across sessions.

## Understanding Streak Tracking

The app tracks consecutive days the market stays in the same sentiment category:

- **Current Streak** - How many days in a row (e.g., "Day 5 of Fear")
- **Historical Records** - The longest streak ever recorded for that category
- **Record Dates** - When records were set (e.g., "record 15 days in May 2026")

## Running Locally

```bash
# Clone the repository
git clone https://github.com/firedintern/meta-fgi.git
cd meta-fgi

# Install dependencies (only needed for backtest scripts)
npm install

# Serves static files + /api functions locally
vercel dev
```

## Running the Backtest

```bash
node scripts/backtest-hindsight-score.js
```

This fetches 5.5 years of FGI + BTC price data and writes `data/backtest-results-5.5years.json`.

## External APIs

| API | Purpose | Endpoint | Cost |
|-----|---------|----------|------|
| Alternative.me | Fear & Greed Index | `https://api.alternative.me/fng/` | Free |
| CoinGecko | Real-time BTC price, dominance, market cap | `https://api.coingecko.com/api/v3/` | Free |
| Binance | BTC price fallback + history | `https://api.binance.com/api/v3/` | Free |
| Telegram Bot API | User alerts | `https://api.telegram.org/` | Free |

## Environment Variables

All secrets live in Vercel environment variables only, never committed to the repo.

| Variable | Purpose |
|----------|---------|
| `TELEGRAM_BOT_TOKEN` | From @BotFather |
| `KV_REST_API_URL` | Vercel KV database URL |
| `KV_REST_API_TOKEN` | Vercel KV auth token |
| `CRON_SECRET` | Protects manual cron triggers |
| `ADMIN_SECRET` | Protects admin endpoints |

## Claude Code Integration

This repo includes [Claude Code](https://docs.anthropic.com/en/docs/claude-code) configuration for AI-assisted development:

- **`CLAUDE.md`** - Project context and rules for Claude Code sessions
- **`DESIGN.md`** - Design system source of truth (dark financial terminal)
- **`.mcp.json`** - MCP servers (Playwright for UI testing, Context7 for docs, Fetch for APIs)
- **Slash Commands:**
  - `/design-review` - Comprehensive UI/UX design review with Playwright screenshots
  - `/code-review` - Pragmatic code quality review of branch changes
  - `/security-review` - Security-focused vulnerability assessment
  - `/frontend-design` - Create distinctive, production-grade frontend interfaces

## Telegram Bot Setup

See [`docs/TELEGRAM-SETUP.md`](docs/TELEGRAM-SETUP.md) for full deployment instructions.

Quick start:
1. Message [@fgichadbot](https://t.me/fgichadbot) on Telegram
2. Send `/start` to subscribe to extreme FGI alerts
3. Receive daily alerts when FGI hits extreme levels

## Customization

### Customize Sentiment Thresholds
```javascript
// app.js
const ZONES = [
  { max: 24,  name: 'Extreme Fear',  cls: 'zone-xfear',   color: '#f85149' },
  { max: 44,  name: 'Fear',          cls: 'zone-fear',    color: '#db6d28' },
  { max: 59,  name: 'Neutral',       cls: 'zone-neutral', color: '#d29922' },
  { max: 79,  name: 'Greed',         cls: 'zone-greed',   color: '#3fb950' },
  { max: 100, name: 'Extreme Greed', cls: 'zone-xgreed',  color: '#2ea043' }
];
```

### Customize Portfolio Advice Thresholds
```javascript
// app.js — getPortfolioAdvice()
if (fgiScore <= 24 && cryptoRatio < 0.3) {
  return { text: 'Sentiment is at extreme fear while your cash allocation is high...', color: COLORS.up };
}
if (fgiScore >= 80 && cryptoRatio > 0.7) {
  return { text: 'Sentiment is at extreme greed while your crypto exposure is high...', color: COLORS.down };
}
```

### Design Tokens
All colors, type scale, spacing, and component rules live in [`DESIGN.md`](DESIGN.md). Read it before making any visual change.

## Contributing

Contributions are welcome! Feel free to:
- Report bugs or issues
- Suggest new features or improvements
- Submit pull requests
- Share feedback on UX/UI

## License

MIT License - feel free to use this project for anything!

## Credits

- Fear & Greed Index data by [Alternative.me](https://alternative.me)
- Bitcoin prices by [CoinGecko](https://www.coingecko.com) and [Binance](https://www.binance.com)

## Links

- **Live Site**: [fgichad.xyz](https://www.fgichad.xyz)
- **GitHub**: [github.com/firedintern/meta-fgi](https://github.com/firedintern/meta-fgi)
- **Telegram Bot**: [@fgichadbot](https://t.me/fgichadbot)
- **Twitter/X**: [@firedintern](https://x.com/firedintern)

---

**Disclaimer**: This tool is for informational purposes only. Portfolio tracking and advice features are educational and do not constitute financial advice. Always do your own research (DYOR) and consult with financial professionals before making investment decisions.
