# 🎰 Fear & Greed Protocol

> Real-time crypto market sentiment tracker with casino-style visualization, portfolio management, and intelligent trading advice

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://www.fgichad.xyz)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌟 Features

### 📊 Real-Time Market Data
- **Fear & Greed Index** - Live crypto market sentiment (0-100)
- **Bitcoin Price Tracker** - Real-time BTC price with 24h change percentage
- **30-Day Historical Chart** - Interactive Chart.js visualization with color-coded sentiment points
- **Auto-Refresh** - Market data updates every 60 seconds, BTC price every 30 seconds

### 🎰 Casino-Style Interface
- **Slot Machine Visualization** - Three-reel emoji-based sentiment display
- **Jackpot Sounds** - Pleasant musical audio feedback using Web Audio API
- **Animated Spinning Reels** - Smooth staggered animations with shake effects
- **Matrix Rain Effect** - Toggleable Matrix-style background animation (✨ button)
- **Win Flash Effects** - Visual burst effects for extreme market conditions
- **Emoji Rain** - Cascading emoji particles after each spin

### 💼 Portfolio Management
- **Portfolio Tracker** - Input and save your crypto, stablecoin, and cash holdings
- **Smart Allocation Advice** - AI-driven recommendations based on Fear & Greed Index and your portfolio balance
- **Visual Portfolio Chart** - Interactive doughnut chart showing your allocation breakdown
- **Persistent Storage** - Portfolio data saved locally in browser
- **Real-time Suggestions** - Dynamic advice like "Deploy your cash - great entry point!" or "Take profits - you're overexposed!"

### 📈 Sentiment Intelligence
- **Streak Tracking** - Shows consecutive days in current sentiment category
- **Historical Records** - Displays longest streak records with dates (e.g., "Record: 15 days in March 2024")
- **Contextual Quotes** - Smart trading wisdom tailored to current market sentiment
- **Sentiment Categories** - 5 levels from Extreme Fear to Extreme Greed with emoji indicators

### 🔔 Smart Notifications & Sharing
- **Extreme Alerts** - Browser notifications for extreme fear/greed levels (score ≤20 or ≥80)
- **Degen Advice** - Trading suggestions from "💎 Accumulate" to "⚠️ Exit Now"
- **Share on X** - One-click Twitter/X sharing with custom formatted text
- **Smart Control Hiding** - Controls auto-hide on mobile scroll for cleaner view

### 📱 Fully Responsive & Accessible
- **Mobile-Optimized Layout** - Touch-friendly with adaptive sizing
- **Keyboard Navigation** - Full keyboard support with visible focus indicators
- **ARIA Labels** - Screen reader friendly with proper roles and states
- **Performance Optimized** - GPU-accelerated animations, throttled matrix effect
- **Progressive Enhancement** - Works without JavaScript (graceful degradation)

## 🚀 Live Demo

**[fgichad.xyz](https://www.fgichad.xyz)**

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Charts**: Chart.js 4.4.0 (Line & Doughnut charts)
- **Storage**: LocalStorage API (portfolio persistence)
- **APIs**:
  - [Alternative.me Fear & Greed Index](https://alternative.me/crypto/fear-and-greed-index/) (current + 365-day history)
  - [CoinGecko API v3](https://www.coingecko.com/en/api) (BTC price & 24h change)
- **Deployment**: Vercel
- **Audio**: Web Audio API (dynamic jackpot sounds)
- **Animations**: CSS3 animations with GPU acceleration
- **Accessibility**: ARIA labels, keyboard navigation support
- **Fonts**: Comic Sans (for degen vibes), Courier New (terminal aesthetic)

## 🎮 How to Use

### Basic Usage
1. Visit [fgichad.xyz](https://www.fgichad.xyz)
2. Watch the slot machine display current sentiment
3. Tap/click the slot machine or 🎰 lever to refresh
4. Enable notifications (🔔) for extreme market alerts

### Controls
- **✨ Matrix Toggle** - Show/hide Matrix background animation
- **🔔 Notifications** - Enable extreme sentiment alerts (score ≤20 or ≥80)
- **💼 Portfolio** - Open portfolio management modal
- **🎰 Spin** - Refresh all data and spin the slot machine
- **Share on X** - Post current sentiment to Twitter/X with custom formatting
- **[REFRESH]** - Manual refresh button for all market data

## 💡 Sentiment Guide

| Score | Status | Emoji | Advice |
|-------|--------|-------|--------|
| 0-24 | Extreme Fear | 💀 | 💎 Accumulate |
| 25-44 | Fear | 😱 | 🤔 Good Entry |
| 45-59 | Neutral | 😐 | 😐 Wait & See |
| 60-79 | Greed | 😏 | 🚨 Take Profits |
| 80-100 | Extreme Greed | 🤑 | ⚠️ Exit Now |

## 💼 Using Portfolio Management

Track your holdings and get smart allocation advice:

1. Click the **💼 Portfolio** button in top-right controls
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

Your portfolio data is saved locally in your browser and persists across sessions.

## 📈 Understanding Streak Tracking

The app tracks consecutive days the market stays in the same sentiment category:

- **Current Streak** - Shows how many days in a row (e.g., "Day 5 of Extreme Fear")
- **Historical Records** - Displays the longest streak ever recorded for that category
- **Record Dates** - Shows when records were set (e.g., "Record: 15 days in Mar 2024")
- **Average Duration** - Typical length of streaks in that category
- **Record Alerts** - 🔥 highlights when you're breaking a record!

Example displays:
- `Day 1 of Extreme Fear (Just started!)`
- `Day 7 of Greed (Above avg! Typical: 4.2 days | Record: 12 days in Jan 2024)`
- `Day 15 of Extreme Fear 🔥 RECORD BROKEN! (Previous: 12 days in Nov 2023)`

This helps identify market turning points and unusually long sentiment periods.

## 💬 Sentiment Quotes

Each sentiment level has contextual trading wisdom:

- **Extreme Fear (0-24)**: 💎 _"Be greedy when others are fearful. Blood in the streets means diamonds in the wallet."_
- **Fear (25-44)**: 🤔 _"The best buys happen when everyone's too scared to click. Your future self will thank you."_
- **Neutral (45-59)**: 😐 _"Boring markets build wealth. Patience pays more than FOMO ever will."_
- **Greed (60-79)**: 🚨 _"When your barber's giving crypto tips, it's time to secure the bag."_
- **Extreme Greed (80-100)**: ⚠️ _"Euphoria is expensive. Everyone's a genius in a bull market until the music stops."_

## 📁 Project Structure

```
meta-fgi/
├── index.html                 # Production website
├── api/                       # Vercel serverless functions
│   ├── fgi.js                 # FGI proxy API
│   ├── telegram-webhook.js    # Telegram bot webhook
│   ├── check-fgi-cron.js      # Daily cron for alerts
│   └── admin-subscribers.js   # Admin endpoint
├── scripts/                   # Utility & data processing scripts
├── data/                      # Backtest results & cached data
├── drafts/                    # Experimental HTML versions
├── docs/                      # Project documentation
│   ├── DATA-SOURCES.md        # API & data source docs
│   ├── BACKTEST-COMPARISON.md # 1yr vs 5.5yr analysis
│   ├── INTEGRATION-SUMMARY.md # Hindsight Score integration
│   └── TELEGRAM-SETUP.md     # Telegram bot deployment
├── .claude/
│   ├── commands/              # Slash commands (/design-review, /code-review, /security-review)
│   └── agents/                # Subagent definitions
├── .mcp.json                  # MCP server configuration
├── CLAUDE.md                  # Claude Code project instructions
└── vercel.json                # Vercel cron config
```

## 🏃 Running Locally
```bash
# Clone the repository
git clone https://github.com/firedintern/meta-fgi.git

# Navigate to the directory
cd meta-fgi

# Install dependencies (only needed for scripts)
npm install

# Open index.html in your browser
open index.html
```

No build process needed! It's vanilla JavaScript.

## 🤖 Claude Code Integration

This repo includes [Claude Code](https://docs.anthropic.com/en/docs/claude-code) configuration for AI-assisted development:

- **`CLAUDE.md`** — Project context and rules for Claude Code sessions
- **`.mcp.json`** — MCP servers (Playwright for UI testing, Context7 for docs, Fetch for APIs)
- **Slash Commands:**
  - `/design-review` — Comprehensive UI/UX design review with Playwright screenshots
  - `/code-review` — Pragmatic code quality review of branch changes
  - `/security-review` — Security-focused vulnerability assessment
- **Subagents:**
  - `@design-review` — Specialized design review agent with Playwright tooling

## 🎨 Customization

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

### Adjust Notification Triggers
```javascript
const extreme = currentScore <= 20 || currentScore >= 80;  // Change thresholds
```

## ✨ Recent Features

**Portfolio Management System**
- Track crypto, stablecoin, and cash holdings
- Get smart allocation advice based on Fear & Greed Index
- Visual doughnut chart with percentage breakdowns

**Streak Tracking & Records**
- Track consecutive days in sentiment categories
- Historical longest streak records with dates
- Average streak duration statistics

**Enhanced UX**
- Sentiment quotes with contextual trading wisdom
- Emoji rain effects and win animations
- Improved accessibility with ARIA labels and keyboard navigation
- Performance optimizations (GPU acceleration, throttled animations)

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs or issues
- Suggest new features or improvements
- Submit pull requests
- Share feedback on UX/UI

## 📝 License

MIT License - feel free to use this project for anything!

## 🙏 Credits

- Fear & Greed Index data by [Alternative.me](https://alternative.me)
- Bitcoin prices by [CoinGecko](https://www.coingecko.com)
- Built with ☕ and late nights

## 🔗 Links

- **Live Site**: [fgichad.xyz](https://www.fgichad.xyz)
- **GitHub**: [github.com/firedintern/meta-fgi](https://github.com/firedintern/meta-fgi)
- **Twitter/X**: [@0xfiredintern](https://twitter.com/0xfiredintern)

---

**⚠️ Disclaimer**: This tool is for entertainment and informational purposes only. Portfolio tracking and advice features are educational tools and do not constitute financial advice. Always do your own research (DYOR) and consult with financial professionals before making investment decisions.

Made with 🎰 by [firedintern](https://twitter.com/0xfiredintern)

