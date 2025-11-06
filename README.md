# 🎰 Fear & Greed Protocol

> Real-time crypto market sentiment tracker with casino-style visualization

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://www.fgichad.xyz)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌟 Features

### 📊 Real-Time Data
- **Fear & Greed Index** - Live crypto market sentiment (0-100)
- **Bitcoin Price Tracker** - Real-time BTC price with 24h change
- **30-Day History** - Interactive chart showing sentiment trends

### 🎰 Casino-Style Interface
- **Slot Machine Visualization** - Emoji-based sentiment display
- **Jackpot Sounds** - Pleasant audio feedback on spin
- **Animated Reels** - Smooth spinning animations
- **Matrix Rain Effect** - Customizable background animation

### 🔔 Smart Features
- **Extreme Alerts** - Browser notifications for extreme fear/greed levels
- **Degen Advice** - Trading suggestions based on current sentiment
- **Share on X** - One-click Twitter/X sharing with custom text
- **Auto-Refresh** - Updates every 60 seconds

### 📱 Fully Responsive
- Mobile-optimized layout
- Touch-friendly interactions
- Smart control hiding on scroll
- Adaptive emoji sizing

## 🚀 Live Demo

**[fgichad.xyz](https://www.fgichad.xyz)**

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Charts**: Chart.js
- **APIs**: 
  - [Alternative.me Fear & Greed Index](https://alternative.me/crypto/fear-and-greed-index/)
  - [CoinGecko](https://www.coingecko.com/en/api)
- **Deployment**: Vercel
- **Audio**: Web Audio API

## 🎮 How to Use

### Basic Usage
1. Visit [fgichad.xyz](https://www.fgichad.xyz)
2. Watch the slot machine display current sentiment
3. Tap/click the slot machine or 🎰 lever to refresh
4. Enable notifications (🔔) for extreme market alerts

### Controls
- **✨ Matrix Toggle** - Show/hide background animation
- **🔔 Notifications** - Enable extreme sentiment alerts
- **🎰 Spin** - Refresh all data
- **Share on X** - Post current sentiment to Twitter

## 💡 Sentiment Guide

| Score | Status | Emoji | Advice |
|-------|--------|-------|--------|
| 0-24 | Extreme Fear | 😱💀 | 💎 Accumulate |
| 25-44 | Fear | 😰 | 🤔 Good Entry |
| 45-59 | Neutral | 😐 | 😐 Wait & See |
| 60-79 | Greed | 😏 | 🚨 Take Profits |
| 80-100 | Extreme Greed | 🤑 | ⚠️ Exit Now |

## 🏃 Running Locally
```bash
# Clone the repository
git clone https://github.com/firedintern/meta-fgi.git

# Navigate to the directory
cd meta-fgi

# Open index.html in your browser
open index.html
```

No build process needed! It's vanilla JavaScript.

## 🎨 Customization

### Change Matrix Effect Opacity
```css
#matrix-canvas { opacity: 0.15; } /* Desktop */
@media (max-width: 768px) {
  #matrix-canvas { opacity: 0.3; } /* Mobile */
}
```

### Modify Auto-Refresh Interval
```javascript
setInterval(fetchData, 60000); // 60 seconds
```

### Customize Sentiment Emojis
```javascript
function getSymbolForScore(s){
  if(s<10)return '💀';  // Change these!
  if(s<25)return '😱';
  // ... etc
}
```

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

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

**⚠️ Disclaimer**: This tool is for entertainment and informational purposes only. Not financial advice. DYOR!

Made with 🎰 by [firedintern](https://twitter.com/0xfiredintern)
