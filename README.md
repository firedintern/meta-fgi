# Fear & Greed Protocol

> Real-time crypto market sentiment tracker with casino-style visualization, portfolio management, Telegram bot alerts, historical backtesting, and Hindsight Score analysis

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://www.fgichad.xyz)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Features

### Real-Time Market Data
- **Fear & Greed Index** - Live crypto market sentiment (0-100), updated daily
- **Bitcoin Price Tracker** - Real-time BTC price with 24h change percentage
- **30-Day Historical Chart** - Interactive Chart.js line chart with color-coded sentiment points
- **Sentiment Distribution Chart** - Donut chart showing how sentiment breaks down across the last 30 days
- **Auto-Refresh** - Market data updates every 60 seconds, BTC price every 30 seconds

### Casino-Style Interface
- **Slot Machine Visualization** - Three-reel emoji-based sentiment display
- **Jackpot Sounds** - Musical audio feedback via Web Audio API
- **Animated Spinning Reels** - Smooth staggered animations with shake effects
- **Matrix Rain Effect** - Toggleable Matrix-style background animation (✨ button)
- **Win Flash Effects** - Visual burst effects for extreme market conditions
- **Emoji Rain** - Cascading emoji particles after each spin

### Portfolio Management
- **Portfolio Tracker** - Input and save your crypto, stablecoin, and cash holdings
- **Smart Allocation Advice** - Recommendations based on Fear & Greed Index and your portfolio balance
- **Visual Portfolio Chart** - Interactive doughnut chart showing allocation breakdown
- **Persistent Storage** - Portfolio data saved locally in browser
- **Real-time Suggestions** - Dynamic advice like "Deploy your cash - great entry point!" or "Take profits - you're overexposed!"

### Hindsight Score
- **Historical Analysis Modal** - Click the 🔮 button to open a full breakdown of how Bitcoin has performed after each FGI range
- **5.5-Year Dataset** - Based on 2,000 days of data (May 2020 - Nov 2025), covering multiple full market cycles
- **Three Time Horizons** - Forward returns at 7, 14, and 30 days for each sentiment range
- **Win Rate Stats** - Sample sizes, win rates, best/worst cases for each range
- **Live-Linked** - Auto-updates to reflect the current FGI score whenever you spin or refresh

**Key finding (5.5-year data):**

| FGI Range | 30d Avg Return | Win Rate |
|-----------|---------------|----------|
| Extreme Fear (0-24) | -0.85% | 48.4% |
| Fear (25-44) | +4.54% | 56.8% |
| Neutral (45-59) | +6.82% | 59.6% |
| Greed (60-79) | +3.97% | 50.8% |
| Extreme Greed (80-100) | +21.87% | 74.8% |

### Sentiment Intelligence
- **Streak Tracking** - Consecutive days in the current sentiment category
- **Historical Records** - Longest streak records with dates (e.g., "Record: 15 days in March 2024")
- **Contextual Quotes** - Trading wisdom tailored to current market sentiment
- **Sentiment Categories** - 5 levels from Extreme Fear to Extreme Greed with emoji indicators

### Telegram Bot Alerts
- **Bot**: [@fgichadbot](https://t.me/fgichadbot)
- **Subscribe** with `/start` to receive Telegram alerts at extreme FGI levels
- **Unsubscribe** with `/stop` at any time
- **Status check** with `/status` to get the current FGI score
- **Daily cron** runs at 4 PM UTC and sends alerts when FGI reaches extreme levels
- Subscriber data stored in Vercel KV (Redis-compatible key-value store)

### Smart Notifications & Sharing
- **Extreme Alerts** - Browser notifications for extreme fear/greed levels (score ≤20 or ≥80)
- **Degen Advice** - Trading suggestions from "💎 Accumulate" to "⚠️ Exit Now"
- **Share on X** - One-click Twitter/X sharing with custom formatted text

### Fully Responsive & Accessible
- **Mobile-Optimized Layout** - Touch-friendly with adaptive sizing
- **Keyboard Navigation** - Full keyboard support with visible focus indicators
- **ARIA Labels** - Screen reader friendly with proper roles and states
- **Performance Optimized** - GPU-accelerated animations, throttled matrix effect

## Live Demo

**[fgichad.xyz](https://www.fgichad.xyz)**

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Charts**: Chart.js 4.4.0 (Line, Doughnut, and Sentiment Distribution charts)
- **Storage**: LocalStorage API (portfolio persistence)
- **Bot Storage**: Vercel KV (Telegram subscriber list)
- **APIs**:
  - [Alternative.me Fear & Greed Index](https://alternative.me/crypto/fear-and-greed-index/) (current + 365-day history)
  - [CoinGecko API v3](https://www.coingecko.com/en/api) (real-time BTC price & 24h change)
  - [CryptoCompare](https://min-api.cryptocompare.com/) (5.5-year BTC price history for backtesting)
- **Deployment**: Vercel (serverless functions + daily cron)
- **Audio**: Web Audio API (dynamic jackpot sounds)
- **Animations**: CSS3 animations with GPU acceleration
- **Accessibility**: ARIA labels, keyboard navigation support
- **Fonts**: Comic Sans (degen vibes), Courier New (terminal aesthetic)

## How to Use

### Basic Usage
1. Visit [fgichad.xyz](https://www.fgichad.xyz)
2. Watch the slot machine display current sentiment
3. Tap/click the slot machine or 🎰 lever to refresh
4. Enable notifications (🔔) for extreme market alerts

### Controls

| Button | Action |
|--------|--------|
| ✨ | Toggle Matrix background animation |
| 🔔 | Enable browser notifications for extreme sentiment (≤20 or ≥80) |
| 💼 | Open portfolio management modal |
| 🔮 | Open Hindsight Score modal (historical analysis) |
| Telegram icon | Subscribe to Telegram bot alerts |
| 🎰 Spin | Refresh all data and spin the slot machine |
| Share on X | Post current sentiment to Twitter/X |

## Sentiment Guide

| Score | Status | Emoji | Degen Advice |
|-------|--------|-------|--------------|
| 0-24 | Extreme Fear | 💀 | 💎 Accumulate |
| 25-44 | Fear | 😱 | 🤔 Good Entry |
| 45-59 | Neutral | 😐 | 😐 Wait & See |
| 60-79 | Greed | 😏 | 🚨 Take Profits |
| 80-100 | Extreme Greed | 🤑 | ⚠️ Exit Now |

## Using Portfolio Management

1. Click the **💼 Portfolio** button in the top-right controls
2. Enter your holdings:
   - **Crypto Holdings ($)** - Your total crypto value (BTC, ETH, alts)
   - **Stablecoins ($)** - USDT, USDC, DAI, etc.
   - **Cash/Fiat ($)** - Fiat currency ready to deploy
3. Click **Save Portfolio**
4. View your allocation breakdown chart and percentage split
5. Get real-time advice based on Fear & Greed Index:
   - **Extreme Fear + High Cash** → "Deploy your cash - great entry point!"
   - **Extreme Greed + High Crypto** → "Take profits - you're overexposed!"
   - **Fear + Low Crypto** → "Good time to increase crypto allocation"
   - **Greed + High Crypto** → "Consider taking some profits"
   - **Balanced** → "Your allocation looks good"

Portfolio data is saved locally in your browser and persists across sessions.

## Understanding Streak Tracking

The app tracks consecutive days the market stays in the same sentiment category:

- **Current Streak** - How many days in a row (e.g., "Day 5 of Extreme Fear")
- **Historical Records** - The longest streak ever recorded for that category
- **Record Dates** - When records were set (e.g., "Record: 15 days in Mar 2024")
- **Record Alerts** - Highlights when you're breaking a record

Example displays:
- `Day 1 of Extreme Fear (Just started!)`
- `Day 7 of Greed (Above avg! Typical: 4.2 days | Record: 12 days in Jan 2024)`
- `Day 15 of Extreme Fear RECORD BROKEN! (Previous: 12 days in Nov 2023)`

## Running Locally

```bash
# Clone the repository
git clone https://github.com/firedintern/meta-fgi.git
cd meta-fgi

# Install dependencies (only needed for backtest scripts)
npm install

# Open in browser — no build step needed
open index.html
```

## Running the Backtest

```bash
node scripts/backtest-hindsight-score.js
```

This fetches 5.5 years of FGI + BTC price data and outputs `data/backtest-results-5.5years.json`.

## Project Structure

```
meta-fgi/
├── index.html                    # Production website (DO NOT modify without approval)
├── api/                          # Vercel serverless functions
│   ├── fgi.js                    # FGI proxy API
│   ├── telegram-webhook.js       # Telegram bot webhook handler
│   ├── check-fgi-cron.js         # Daily cron — checks FGI & sends Telegram alerts
│   └── admin-subscribers.js      # Admin endpoint for subscriber management
├── scripts/                      # Utility & data processing
│   ├── backtest-hindsight-score.js  # 5.5-year FGI + BTC backtest
│   ├── create-integration.js     # Integration automation
│   ├── explain-overlap.js        # Data overlap analysis
│   ├── extract-cmc-fgi.js        # CMC data extraction
│   ├── playwright.config.js      # Playwright test config
│   ├── test-api-limits.js        # API rate limit testing
│   ├── test-btc-alternatives.js  # Alternative BTC source testing
│   └── test-cmc-api.js           # CMC API testing
├── data/                         # Backtest results & cached data
│   ├── backtest-results-5.5years.json  # Full 5.5-year backtest output
│   ├── backtest-results.json     # 1-year backtest output
│   ├── hindsight-data.csv        # Raw CSV data
│   └── cmc-page-shared-data.json # CoinMarketCap cached data
├── drafts/                       # Experimental HTML versions (not production)
│   ├── hindsight-score-demo.html # Standalone Hindsight Score demo
│   ├── index-full-integration.html  # Full integration prototype
│   └── index-with-hindsight.html # Hindsight integration draft
├── docs/                         # Project documentation
│   ├── DATA-SOURCES.md           # API & data source details
│   ├── BACKTEST-COMPARISON.md    # 1-year vs 5.5-year analysis
│   ├── INTEGRATION-SUMMARY.md    # Hindsight Score integration notes
│   └── TELEGRAM-SETUP.md         # Telegram bot deployment guide
├── .claude/
│   ├── commands/                 # Slash command definitions
│   ├── skills/                   # Claude Code skill configs
│   │   └── frontend-design.md    # Frontend design skill
│   └── agents/                   # Subagent definitions
├── .mcp.json                     # MCP server configuration
├── CLAUDE.md                     # Claude Code project instructions
├── vercel.json                   # Vercel cron + headers config
└── package.json                  # Node.js dependencies (axios)
```

## External APIs

| API | Purpose | Endpoint | Cost |
|-----|---------|----------|------|
| Alternative.me | Fear & Greed Index | `https://api.alternative.me/fng/` | Free |
| CoinGecko | Real-time BTC price | `https://api.coingecko.com/api/v3/` | Free |
| CryptoCompare | BTC price history (backtesting) | `https://min-api.cryptocompare.com/data/v2/histoday` | Free (100k/mo) |
| Telegram Bot API | User alerts | `https://api.telegram.org/` | Free |

## Environment Variables

All secrets live in Vercel environment variables only — never committed to the repo.

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
- **`.mcp.json`** - MCP servers (Playwright for UI testing, Context7 for docs, Fetch for APIs)
- **Slash Commands:**
  - `/design-review` - Comprehensive UI/UX design review with Playwright screenshots
  - `/code-review` - Pragmatic code quality review of branch changes
  - `/security-review` - Security-focused vulnerability assessment
  - `/frontend-design` - Create distinctive, production-grade frontend interfaces
- **Subagents:**
  - `@design-review` - Specialized design review agent with Playwright tooling

## Telegram Bot Setup

See [`docs/TELEGRAM-SETUP.md`](docs/TELEGRAM-SETUP.md) for full deployment instructions.

Quick start:
1. Message [@fgichadbot](https://t.me/fgichadbot) on Telegram
2. Send `/start` to subscribe to extreme FGI alerts
3. Receive daily alerts when FGI hits extreme levels (≤25 or ≥75)

## Customization

### Change Matrix Effect Opacity
```css
#matrix-canvas { opacity: 0.15; } /* Desktop */
@media (max-width: 768px) {
  #matrix-canvas { opacity: 0.3; } /* Mobile */
}
```

### Modify Auto-Refresh Intervals
```javascript
setInterval(fetchData, 60000);      // Fear & Greed data (60 seconds)
setInterval(fetchBTCPrice, 30000);  // Bitcoin price (30 seconds)
```

### Customize Sentiment Emojis & Thresholds
```javascript
function getSymbolForScore(s){
  if(s<=24)return '💀';  // Extreme Fear: 0-24
  if(s<=44)return '😱';  // Fear: 25-44
  if(s<=59)return '😐';  // Neutral: 45-59
  if(s<=79)return '😏';  // Greed: 60-79
  return '🤑';           // Extreme Greed: 80-100
}
```

### Customize Portfolio Advice Thresholds
```javascript
// Extreme Fear + High Cash (cryptoRatio < 30%)
if (fgiScore < 25 && cryptoRatio < 0.3) {
  return { text: "Deploy your cash - great entry point!", color: "#44ff88" };
}

// Extreme Greed + High Crypto (cryptoRatio > 70%)
if (fgiScore > 79 && cryptoRatio > 0.7) {
  return { text: "Take profits - you're overexposed!", color: "#ff4444" };
}
```

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
- Bitcoin prices by [CoinGecko](https://www.coingecko.com) and [CryptoCompare](https://www.cryptocompare.com)
- Built with coffee and late nights

## Links

- **Live Site**: [fgichad.xyz](https://www.fgichad.xyz)
- **GitHub**: [github.com/firedintern/meta-fgi](https://github.com/firedintern/meta-fgi)
- **Telegram Bot**: [@fgichadbot](https://t.me/fgichadbot)
- **Twitter/X**: [@0xfiredintern](https://twitter.com/0xfiredintern)

---

**Disclaimer**: This tool is for entertainment and informational purposes only. Portfolio tracking and advice features are educational tools and do not constitute financial advice. Always do your own research (DYOR) and consult with financial professionals before making investment decisions.
