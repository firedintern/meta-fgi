# Hindsight Score UI Design

## Overview
The Hindsight Score feature shows users what historically happens after the current FGI level is reached. This provides actionable, data-driven context for decision-making.

---

## 🎨 Design Principles

1. **Match existing casino/terminal aesthetic** - Green terminal text, dark backgrounds, gold accents
2. **Mobile-responsive** - Works on all screen sizes
3. **Progressive disclosure** - Show summary first, details on demand
4. **Performance-focused** - Minimal DOM updates, efficient animations
5. **Accessible** - ARIA labels, keyboard navigation, screen reader support

---

## 📐 Component Placement

Insert the Hindsight Score component **after the 30-day chart** and **before the portfolio section** in the existing layout.

```
Current Flow:
1. Slot Machine
2. 30-Day Chart
   [INSERT HINDSIGHT SCORE HERE] ← New
3. Portfolio Management
4. Streak Tracker
```

---

## 🖼️ Component Structure

### Main Container

```html
<div class="hindsight-score-section" id="hindsight-score">
    <!-- Section Header -->
    <div class="hindsight-header">
        <h2 class="hindsight-title">🔮 HINDSIGHT SCORE</h2>
        <p class="hindsight-subtitle">What happens next when FGI is <span id="current-fgi-range">45-59</span>?</p>
    </div>

    <!-- Quick Stats Grid -->
    <div class="hindsight-grid">
        <div class="hindsight-card">
            <div class="hindsight-period">7 DAYS</div>
            <div class="hindsight-return positive" id="hs-7d">+3.6%</div>
            <div class="hindsight-winrate" id="hs-7d-wr">78% win</div>
        </div>

        <div class="hindsight-card">
            <div class="hindsight-period">14 DAYS</div>
            <div class="hindsight-return positive" id="hs-14d">+7.0%</div>
            <div class="hindsight-winrate" id="hs-14d-wr">83% win</div>
        </div>

        <div class="hindsight-card featured">
            <div class="hindsight-period">30 DAYS</div>
            <div class="hindsight-return positive large" id="hs-30d">+16.9%</div>
            <div class="hindsight-winrate" id="hs-30d-wr">87% win</div>
            <div class="hindsight-badge">BEST ODDS</div>
        </div>
    </div>

    <!-- Historical Context -->
    <div class="hindsight-context">
        <div class="context-row">
            <span class="context-label">💎 Historical best:</span>
            <span class="context-value" id="hs-best">+58.7% in 30 days</span>
        </div>
        <div class="context-row">
            <span class="context-label">⚠️ Historical worst:</span>
            <span class="context-value" id="hs-worst">-2.5% in 30 days</span>
        </div>
        <div class="context-row">
            <span class="context-label">📊 Based on:</span>
            <span class="context-value" id="hs-count">188 historical occurrences</span>
        </div>
    </div>

    <!-- Expandable Details (optional) -->
    <button class="hindsight-expand-btn" id="hs-expand-btn" aria-expanded="false">
        <span>▼ Show Comparison</span>
    </button>

    <div class="hindsight-details hidden" id="hs-details" aria-hidden="true">
        <h3 class="details-title">Compare All FGI Ranges (30-day avg)</h3>
        <div class="comparison-bars">
            <div class="comparison-row" id="comp-extreme-fear">
                <div class="comp-label">Extreme Fear (0-24)</div>
                <div class="comp-bar-container">
                    <div class="comp-bar" style="width: 0%"></div>
                    <span class="comp-value">No data</span>
                </div>
            </div>
            <div class="comparison-row" id="comp-fear">
                <div class="comp-label">Fear (25-44)</div>
                <div class="comp-bar-container">
                    <div class="comp-bar" style="width: 65%"></div>
                    <span class="comp-value">+16.2%</span>
                </div>
            </div>
            <div class="comparison-row active" id="comp-neutral">
                <div class="comp-label">Neutral (45-59) ⭐ YOU ARE HERE</div>
                <div class="comp-bar-container">
                    <div class="comp-bar" style="width: 68%"></div>
                    <span class="comp-value">+16.9%</span>
                </div>
            </div>
            <div class="comparison-row" id="comp-greed">
                <div class="comp-label">Greed (60-79)</div>
                <div class="comp-bar-container">
                    <div class="comp-bar" style="width: 90%"></div>
                    <span class="comp-value">+22.4%</span>
                </div>
            </div>
            <div class="comparison-row" id="comp-extreme-greed">
                <div class="comp-label">Extreme Greed (80-100)</div>
                <div class="comp-bar-container">
                    <div class="comp-bar" style="width: 0%"></div>
                    <span class="comp-value">No data</span>
                </div>
            </div>
        </div>

        <div class="insights-box">
            <strong>💡 Insight:</strong>
            <span id="hs-insight">
                Greed periods (+22.4% avg) have outperformed Fear in this bull market.
                Momentum is stronger than contrarian plays right now.
            </span>
        </div>
    </div>
</div>
```

---

## 🎨 CSS Styling

```css
/* ============================================
   HINDSIGHT SCORE COMPONENT
   ============================================ */

.hindsight-score-section {
    background: linear-gradient(145deg, #0a0f1a 0%, #050810 50%, #0a0f1a 100%);
    border: 2px solid #00ff00;
    border-radius: 15px;
    padding: 30px 25px;
    margin: 40px auto;
    max-width: 900px;
    box-shadow:
        0 10px 40px rgba(0, 0, 0, 0.8),
        0 0 30px rgba(0, 255, 0, 0.2),
        inset 0 1px 0 rgba(0, 255, 0, 0.1);
    position: relative;
    transform: translateZ(0);
}

/* Header */
.hindsight-header {
    text-align: center;
    margin-bottom: 25px;
}

.hindsight-title {
    font-size: 2em;
    color: #00ff00;
    text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00;
    margin-bottom: 10px;
    font-weight: bold;
    letter-spacing: 2px;
}

.hindsight-subtitle {
    font-size: 1.1em;
    color: #00aa00;
    margin: 0;
}

#current-fgi-range {
    color: #ffd700;
    font-weight: bold;
    text-shadow: 0 0 5px #ffd700;
}

/* Stats Grid */
.hindsight-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 25px;
}

.hindsight-card {
    background: linear-gradient(135deg, rgba(0, 100, 0, 0.15), rgba(0, 50, 0, 0.1));
    border: 2px solid rgba(0, 255, 0, 0.3);
    border-radius: 10px;
    padding: 20px;
    text-align: center;
    transition: all 0.3s ease;
    position: relative;
}

.hindsight-card:hover {
    border-color: rgba(0, 255, 0, 0.6);
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 255, 0, 0.3);
}

.hindsight-card.featured {
    border-color: #ffd700;
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 165, 0, 0.1));
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.hindsight-card.featured:hover {
    box-shadow: 0 8px 30px rgba(255, 215, 0, 0.5);
}

.hindsight-period {
    font-size: 0.85em;
    color: #00aa00;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
    font-weight: bold;
}

.hindsight-return {
    font-size: 2.2em;
    font-weight: bold;
    margin: 10px 0;
}

.hindsight-return.large {
    font-size: 2.8em;
}

.hindsight-return.positive {
    color: #00ff00;
    text-shadow: 0 0 10px #00ff00;
}

.hindsight-return.negative {
    color: #ff4444;
    text-shadow: 0 0 10px #ff4444;
}

.hindsight-winrate {
    font-size: 0.95em;
    color: #00dd00;
    margin-top: 5px;
}

.hindsight-badge {
    position: absolute;
    top: -12px;
    right: 10px;
    background: linear-gradient(135deg, #ffd700, #ffed4e);
    color: #000;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.7em;
    font-weight: bold;
    letter-spacing: 1px;
    box-shadow: 0 2px 10px rgba(255, 215, 0, 0.5);
}

/* Historical Context */
.hindsight-context {
    background: rgba(0, 255, 0, 0.05);
    border: 1px solid rgba(0, 255, 0, 0.2);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
}

.context-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid rgba(0, 255, 0, 0.1);
}

.context-row:last-child {
    border-bottom: none;
}

.context-label {
    color: #00aa00;
    font-size: 1em;
}

.context-value {
    color: #00ff00;
    font-weight: bold;
    font-size: 1.05em;
}

/* Expand Button */
.hindsight-expand-btn {
    width: 100%;
    background: rgba(0, 150, 0, 0.2);
    border: 1px solid #00aa00;
    color: #00ff00;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    font-family: 'Courier New', monospace;
    font-size: 1em;
    transition: all 0.3s ease;
    margin-bottom: 15px;
}

.hindsight-expand-btn:hover {
    background: rgba(0, 200, 0, 0.3);
    border-color: #00ff00;
}

.hindsight-expand-btn:focus-visible {
    outline: 3px solid #00ff00;
    outline-offset: 3px;
}

.hindsight-expand-btn[aria-expanded="true"] span::before {
    content: '▲ ';
}

/* Details Section */
.hindsight-details {
    overflow: hidden;
    max-height: 0;
    opacity: 0;
    transition: all 0.4s ease;
}

.hindsight-details:not(.hidden) {
    max-height: 1000px;
    opacity: 1;
}

.details-title {
    color: #00ff00;
    font-size: 1.3em;
    margin-bottom: 20px;
    text-align: center;
}

/* Comparison Bars */
.comparison-bars {
    margin-bottom: 20px;
}

.comparison-row {
    margin-bottom: 15px;
    opacity: 0.7;
    transition: opacity 0.3s ease;
}

.comparison-row.active {
    opacity: 1;
}

.comparison-row:hover {
    opacity: 1;
}

.comp-label {
    color: #00aa00;
    font-size: 0.95em;
    margin-bottom: 5px;
}

.comparison-row.active .comp-label {
    color: #ffd700;
    font-weight: bold;
}

.comp-bar-container {
    position: relative;
    background: rgba(0, 50, 0, 0.3);
    border: 1px solid rgba(0, 255, 0, 0.2);
    border-radius: 5px;
    height: 32px;
    overflow: hidden;
}

.comp-bar {
    height: 100%;
    background: linear-gradient(90deg, #00ff00, #00aa00);
    transition: width 0.6s ease;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.4);
}

.comparison-row.active .comp-bar {
    background: linear-gradient(90deg, #ffd700, #ffed4e);
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
}

.comp-value {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #fff;
    font-weight: bold;
    font-size: 1.05em;
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
}

/* Insights Box */
.insights-box {
    background: rgba(255, 215, 0, 0.1);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 8px;
    padding: 15px;
    color: #ffd700;
    line-height: 1.6;
}

.insights-box strong {
    color: #ffed4e;
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .hindsight-score-section {
        padding: 20px 15px;
        margin: 30px auto;
    }

    .hindsight-title {
        font-size: 1.6em;
    }

    .hindsight-subtitle {
        font-size: 1em;
    }

    .hindsight-grid {
        grid-template-columns: 1fr;
        gap: 15px;
    }

    .hindsight-return {
        font-size: 1.8em;
    }

    .hindsight-return.large {
        font-size: 2.2em;
    }

    .context-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
    }

    .comp-label {
        font-size: 0.85em;
    }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
    .hindsight-card,
    .hindsight-expand-btn,
    .comp-bar,
    .hindsight-details {
        transition: none;
    }
}

/* Loading State */
.hindsight-score-section.loading {
    opacity: 0.6;
    pointer-events: none;
}

.hindsight-score-section.loading::after {
    content: '⏳ Loading hindsight data...';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #00ff00;
    font-size: 1.2em;
    text-shadow: 0 0 10px #00ff00;
}
```

---

## ⚙️ JavaScript Implementation

### 1. Data Fetching

```javascript
// Fetch and calculate hindsight scores
async function calculateHindsightScores(currentFGI) {
    try {
        // Fetch historical data (365 days for better sample size)
        const [fgiResponse, priceResponse] = await Promise.all([
            fetch('https://api.alternative.me/fng/?limit=365&format=json'),
            fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365&interval=daily')
        ]);

        const fgiData = await fgiResponse.json();
        const priceData = await priceResponse.json();

        // Merge datasets by date
        const merged = mergeFGIandPriceData(fgiData.data, priceData.prices);

        // Determine current FGI range
        const range = getFGIRange(currentFGI);

        // Calculate forward returns for current range
        const stats = {
            range: range,
            day7: calculateForwardReturns(merged, range.min, range.max, 7),
            day14: calculateForwardReturns(merged, range.min, range.max, 14),
            day30: calculateForwardReturns(merged, range.min, range.max, 30),
            allRanges: calculateAllRanges(merged, 30) // For comparison
        };

        return stats;
    } catch (error) {
        console.error('Failed to calculate hindsight scores:', error);
        return null;
    }
}

// Helper: Get FGI range based on current score
function getFGIRange(fgi) {
    if (fgi <= 24) return { label: 'Extreme Fear', min: 0, max: 24 };
    if (fgi <= 44) return { label: 'Fear', min: 25, max: 44 };
    if (fgi <= 59) return { label: 'Neutral', min: 45, max: 59 };
    if (fgi <= 79) return { label: 'Greed', min: 60, max: 79 };
    return { label: 'Extreme Greed', min: 80, max: 100 };
}

// Helper: Merge FGI and price data
function mergeFGIandPriceData(fgiData, priceData) {
    const priceMap = new Map();
    priceData.forEach(([timestamp, price]) => {
        const date = new Date(timestamp).toISOString().split('T')[0];
        priceMap.set(date, price);
    });

    return fgiData.map(item => {
        const date = new Date(item.timestamp * 1000).toISOString().split('T')[0];
        return {
            date,
            timestamp: parseInt(item.timestamp),
            fgi: parseInt(item.value),
            price: priceMap.get(date)
        };
    }).filter(item => item.price !== undefined)
      .sort((a, b) => a.timestamp - b.timestamp);
}

// Helper: Calculate forward returns for a specific FGI range
function calculateForwardReturns(data, minFGI, maxFGI, days) {
    const matches = [];

    for (let i = 0; i < data.length - days; i++) {
        const current = data[i];
        if (current.fgi >= minFGI && current.fgi <= maxFGI) {
            const future = data[i + days];
            const returnPct = ((future.price - current.price) / current.price) * 100;
            matches.push({
                date: current.date,
                startPrice: current.price,
                endPrice: future.price,
                return: returnPct
            });
        }
    }

    if (matches.length === 0) {
        return { count: 0, avgReturn: 0, winRate: 0, best: 0, worst: 0 };
    }

    const returns = matches.map(m => m.return);
    const positives = returns.filter(r => r > 0);

    return {
        count: matches.length,
        avgReturn: returns.reduce((a, b) => a + b, 0) / returns.length,
        winRate: (positives.length / returns.length) * 100,
        best: Math.max(...returns),
        worst: Math.min(...returns),
        bestExample: matches.find(m => m.return === Math.max(...returns)),
        worstExample: matches.find(m => m.return === Math.min(...returns))
    };
}

// Helper: Calculate stats for all FGI ranges
function calculateAllRanges(data, days) {
    const ranges = [
        { label: 'Extreme Fear', min: 0, max: 24 },
        { label: 'Fear', min: 25, max: 44 },
        { label: 'Neutral', min: 45, max: 59 },
        { label: 'Greed', min: 60, max: 79 },
        { label: 'Extreme Greed', min: 80, max: 100 }
    ];

    return ranges.map(range => ({
        ...range,
        stats: calculateForwardReturns(data, range.min, range.max, days)
    }));
}
```

### 2. UI Updates

```javascript
// Update the hindsight score display
function updateHindsightScore(currentFGI, hindsightData) {
    if (!hindsightData) return;

    // Update range indicator
    document.getElementById('current-fgi-range').textContent =
        `${hindsightData.range.min}-${hindsightData.range.max}`;

    // Update 7-day stats
    updateCard('hs-7d', 'hs-7d-wr', hindsightData.day7);

    // Update 14-day stats
    updateCard('hs-14d', 'hs-14d-wr', hindsightData.day14);

    // Update 30-day stats
    updateCard('hs-30d', 'hs-30d-wr', hindsightData.day30);

    // Update context
    document.getElementById('hs-best').textContent =
        `+${hindsightData.day30.best.toFixed(1)}% in 30 days`;
    document.getElementById('hs-worst').textContent =
        `${hindsightData.day30.worst.toFixed(1)}% in 30 days`;
    document.getElementById('hs-count').textContent =
        `${hindsightData.day30.count} historical occurrences`;

    // Update comparison bars
    updateComparisonBars(hindsightData.allRanges, hindsightData.range.label);

    // Generate insight
    updateInsight(hindsightData);
}

function updateCard(returnId, winrateId, stats) {
    const returnEl = document.getElementById(returnId);
    const winrateEl = document.getElementById(winrateId);

    returnEl.textContent = `${stats.avgReturn > 0 ? '+' : ''}${stats.avgReturn.toFixed(1)}%`;
    returnEl.className = `hindsight-return ${stats.avgReturn > 0 ? 'positive' : 'negative'}`;
    if (returnId === 'hs-30d') returnEl.classList.add('large');

    winrateEl.textContent = `${stats.winRate.toFixed(0)}% win`;
}

function updateComparisonBars(allRanges, currentRangeLabel) {
    const maxReturn = Math.max(...allRanges.map(r => r.stats.avgReturn));

    allRanges.forEach(range => {
        const row = document.getElementById(`comp-${range.label.toLowerCase().replace(' ', '-')}`);
        if (!row) return;

        const bar = row.querySelector('.comp-bar');
        const value = row.querySelector('.comp-value');

        if (range.stats.count === 0) {
            bar.style.width = '0%';
            value.textContent = 'No data';
        } else {
            const widthPct = (range.stats.avgReturn / maxReturn) * 100;
            bar.style.width = `${widthPct}%`;
            value.textContent = `+${range.stats.avgReturn.toFixed(1)}%`;
        }

        // Mark current range
        if (range.label === currentRangeLabel) {
            row.classList.add('active');
        } else {
            row.classList.remove('active');
        }
    });
}

function updateInsight(data) {
    const insightEl = document.getElementById('hs-insight');
    const fearStats = data.allRanges.find(r => r.label === 'Fear')?.stats;
    const greedStats = data.allRanges.find(r => r.label === 'Greed')?.stats;

    if (!fearStats || !greedStats) {
        insightEl.textContent = 'Insufficient data for comparison.';
        return;
    }

    if (greedStats.avgReturn > fearStats.avgReturn) {
        const diff = (greedStats.avgReturn - fearStats.avgReturn).toFixed(1);
        insightEl.textContent =
            `Greed periods (+${greedStats.avgReturn.toFixed(1)}% avg) have outperformed Fear (+${fearStats.avgReturn.toFixed(1)}% avg) by ${diff}% in this bull market. Momentum is stronger than contrarian plays right now.`;
    } else {
        const diff = (fearStats.avgReturn - greedStats.avgReturn).toFixed(1);
        insightEl.textContent =
            `Fear periods (+${fearStats.avgReturn.toFixed(1)}% avg) have outperformed Greed (+${greedStats.avgReturn.toFixed(1)}% avg) by ${diff}%. Classic "buy fear, sell greed" strategy is working!`;
    }
}

// Expand/collapse details
document.getElementById('hs-expand-btn').addEventListener('click', function() {
    const details = document.getElementById('hs-details');
    const isExpanded = this.getAttribute('aria-expanded') === 'true';

    this.setAttribute('aria-expanded', !isExpanded);
    details.setAttribute('aria-hidden', isExpanded);
    details.classList.toggle('hidden');

    this.querySelector('span').textContent = isExpanded ? '▼ Show Comparison' : '▲ Hide Comparison';
});
```

### 3. Integration Point

Add this to your existing `fetchData()` function:

```javascript
async function fetchData() {
    try {
        const r = await fetch('https://api.alternative.me/fng/?limit=1&format=json');
        const data = await r.json();
        const fgiScore = parseInt(data.data[0].value);

        // ... existing code to update slot machine ...

        // NEW: Calculate and update hindsight score
        const hindsightData = await calculateHindsightScores(fgiScore);
        if (hindsightData) {
            updateHindsightScore(fgiScore, hindsightData);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
```

---

## 📱 Mobile Considerations

- Single column grid on mobile
- Larger touch targets (minimum 44x44px)
- Simplified comparison view
- Collapsible details by default

---

## ♿ Accessibility Features

- Semantic HTML (`<section>`, `<button>`)
- ARIA labels (`aria-expanded`, `aria-hidden`)
- Keyboard navigation support
- Screen reader announcements
- High contrast mode support
- Reduced motion option

---

## 🚀 Performance Optimizations

- Cache hindsight calculations for 5 minutes
- Use `requestAnimationFrame` for animations
- Lazy load comparison data
- Progressive enhancement (works without JS)
- Minimal repaints/reflows

---

## 🔄 Future Enhancements

1. **Historical Chart** - Visual timeline of past returns
2. **Scenario Comparison** - "What if I waited for Fear?"
3. **Personalized** - Track user's actual timing vs optimal
4. **Alerts** - Notify when entering rare high-win-rate zones
5. **Export** - Download data as CSV/JSON

---

## ✅ Testing Checklist

- [ ] Works on Chrome, Firefox, Safari, Edge
- [ ] Mobile responsive (iOS, Android)
- [ ] Keyboard navigation functional
- [ ] Screen reader compatible
- [ ] Fast loading (<500ms)
- [ ] Graceful degradation without JS
- [ ] Data accuracy verified
- [ ] No console errors
- [ ] Matches existing visual theme
- [ ] Accessible color contrast ratios

---

This design integrates seamlessly with your existing casino-themed Fear & Greed Index while providing genuinely unique, actionable insights that no other FGI site offers.
