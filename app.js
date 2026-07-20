// FGI CHAD terminal frontend. Tokens mirror styles.css / DESIGN.md.
let currentScore = null; // null until the first successful FGI fetch

// ── Entrance sequence (first load only, never on manual Refresh) ─────────
const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let entranceDone = false;

function revealEntrance() {
    if (entranceDone) return;
    entranceDone = true;
    const items = document.querySelectorAll('.entrance-item');
    items.forEach((el, i) => {
        if (prefersReducedMotion) {
            el.classList.add('in');
            return;
        }
        setTimeout(() => el.classList.add('in'), i * 60);
    });
}

function animateGaugeEntrance() {
    const marker = document.getElementById('gaugeMarker');
    if (!marker || prefersReducedMotion) return;
    marker.classList.add('entrance-sweep');
    // Drop the slow transition after the sweep completes so later refreshes
    // use the normal 300ms snap, not another 900ms sweep.
    setTimeout(() => marker.classList.remove('entrance-sweep'), 1000);
}

function animateScoreCountUp(target) {
    const el = document.getElementById('fgiScore');
    if (!el) return;
    if (prefersReducedMotion) {
        el.textContent = target;
        return;
    }
    const duration = 700;
    const start = performance.now();
    function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
        el.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
    }
    requestAnimationFrame(tick);
}

const ZONES = [
    { max: 24,  name: 'Extreme Fear',  cls: 'zone-xfear',   color: '#f85149' },
    { max: 44,  name: 'Fear',          cls: 'zone-fear',    color: '#db6d28' },
    { max: 59,  name: 'Neutral',       cls: 'zone-neutral', color: '#d29922' },
    { max: 79,  name: 'Greed',         cls: 'zone-greed',   color: '#3fb950' },
    { max: 100, name: 'Extreme Greed', cls: 'zone-xgreed',  color: '#2ea043' }
];

const COLORS = {
    text: '#e6edf3',
    secondary: '#8b949e',
    muted: '#484f58',
    grid: '#1d222b',
    border: '#2a303a',
    surface: '#11151c',
    raised: '#171c24',
    accent: '#f7931a',
    up: '#3fb950',
    down: '#f85149'
};

const MONO = "'JetBrains Mono', 'SF Mono', Menlo, monospace";
const UI_FONT = "'Inter', system-ui, sans-serif";

function getZone(score) {
    return ZONES.find(z => score <= z.max) || ZONES[ZONES.length - 1];
}

function getColorForScore(s) {
    return getZone(s).color;
}

function getSentimentCategory(score) {
    return getZone(score).name;
}

// Professional signal copy per zone (replaces the old degen strings)
const SIGNAL_MAP = {
    'Extreme Fear': 'Historically an accumulation zone',
    'Fear': 'Sentiment below the historical average',
    'Neutral': 'No directional signal',
    'Greed': 'Sentiment elevated above average',
    'Extreme Greed': 'Historically a distribution zone'
};

// Simple cache to reduce API calls and avoid rate limiting
const apiCache = {
    btcPrice: { data: null, timestamp: 0 },
    globalData: { data: null, timestamp: 0 },
    dvol: { data: null, timestamp: 0 }
};
const CACHE_DURATION = 60000; // 60 seconds

function isCacheValid(cacheKey) {
    const cache = apiCache[cacheKey];
    return cache.data && (Date.now() - cache.timestamp) < CACHE_DURATION;
}

let globalDataInflight = null;

async function fetchGlobalData() {
    if (isCacheValid('globalData')) {
        return apiCache.globalData.data;
    }
    // Dedup: dominance + market cap both call this on a cold cache
    if (globalDataInflight) return globalDataInflight;
    globalDataInflight = (async () => {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/global', {
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            apiCache.globalData = { data: data.data, timestamp: Date.now() };
            return data.data;
        } catch (error) {
            console.error('Error fetching global data:', error);
            return null;
        } finally {
            globalDataInflight = null;
        }
    })();
    return globalDataInflight;
}

function renderBTCPrice(price, change) {
    document.getElementById('btcPrice').textContent =
        '$' + price.toLocaleString('en-US', { maximumFractionDigits: 0 });
    const changeEl = document.getElementById('btcChange');
    changeEl.textContent = (change > 0 ? '+' : '') + change.toFixed(2) + '% (24h)';
    changeEl.className = 'card-sub ' + (change >= 0 ? 'up' : 'down');
}

async function fetchBTCPrice() {
    if (isCacheValid('btcPrice')) {
        const cached = apiCache.btcPrice.data;
        renderBTCPrice(cached.price, cached.change);
        return;
    }
    try {
        const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true', {
            headers: { 'Accept': 'application/json' }
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = await r.json();
        if (!d.bitcoin || typeof d.bitcoin.usd !== 'number' || typeof d.bitcoin.usd_24h_change !== 'number') {
            throw new Error('Invalid data');
        }
        apiCache.btcPrice = { data: { price: d.bitcoin.usd, change: d.bitcoin.usd_24h_change }, timestamp: Date.now() };
        renderBTCPrice(d.bitcoin.usd, d.bitcoin.usd_24h_change);
    } catch (e) {
        console.error('BTC price error:', e);
        try {
            // Binance public ticker: free, CORS-enabled (CoinCap v2 was sunset)
            const r2 = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
            const d2 = await r2.json();
            const p = parseFloat(d2.lastPrice);
            const c = parseFloat(d2.priceChangePercent);
            if (!Number.isFinite(p) || !Number.isFinite(c)) throw new Error('Invalid fallback data');
            apiCache.btcPrice = { data: { price: p, change: c }, timestamp: Date.now() };
            renderBTCPrice(p, c);
        } catch (e2) {
            console.error('Fallback BTC price error:', e2);
            document.getElementById('btcPrice').textContent = 'Unavailable';
            document.getElementById('btcChange').textContent = '';
        }
    }
}

async function fetchBTCDominance() {
    const globalData = await fetchGlobalData();
    if (globalData && globalData.market_cap_percentage && globalData.market_cap_percentage.btc) {
        document.getElementById('btcDominance').textContent =
            globalData.market_cap_percentage.btc.toFixed(2) + '%';
    } else {
        document.getElementById('btcDominance').textContent = 'N/A';
    }
}

async function fetchBTCMarketCap() {
    const globalData = await fetchGlobalData();
    if (globalData && globalData.total_market_cap && globalData.total_market_cap.usd && globalData.market_cap_percentage && globalData.market_cap_percentage.btc) {
        const btcMarketCap = globalData.total_market_cap.usd * (globalData.market_cap_percentage.btc / 100);
        let formatted;
        if (btcMarketCap >= 1e12) {
            formatted = '$' + (btcMarketCap / 1e12).toFixed(2) + 'T';
        } else if (btcMarketCap >= 1e9) {
            formatted = '$' + (btcMarketCap / 1e9).toFixed(2) + 'B';
        } else {
            formatted = '$' + (btcMarketCap / 1e6).toFixed(2) + 'M';
        }
        document.getElementById('btcMarketCap').textContent = formatted;
    } else {
        console.error('Invalid market cap data');
        document.getElementById('btcMarketCap').textContent = 'N/A';
    }
}

// DVOL is an annualized % with no fixed ceiling (unlike the 0-100 FGI scale).
// Bands reflect BTC's typical historical DVOL behavior: calm markets sit in
// the 30s-40s, 50-70 is normal-to-elevated crypto volatility, 80+ has
// historically coincided with crisis conditions (e.g. FTX collapse, Mar 2020).
function getDVOLQualifier(value) {
    if (value < 40) return { label: 'Calm', cls: 'up' };
    if (value < 60) return { label: 'Normal', cls: '' };
    if (value < 80) return { label: 'Elevated', cls: 'warn' };
    return { label: 'Turbulent', cls: 'down' };
}

function renderDVOL(value) {
    document.getElementById('btcVolatility').textContent = value.toFixed(1) + '%';
    const qualifier = getDVOLQualifier(value);
    const descEl = document.getElementById('btcVolatilityDesc');
    descEl.textContent = qualifier.label + ' · implied vol';
    descEl.className = 'card-sub' + (qualifier.cls ? ' ' + qualifier.cls : '');
}

async function fetchDVOL() {
    if (isCacheValid('dvol')) {
        renderDVOL(apiCache.dvol.data);
        return;
    }
    try {
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        const r = await fetch(`https://www.deribit.com/api/v2/public/get_volatility_index_data?currency=BTC&start_timestamp=${oneHourAgo}&end_timestamp=${now}&resolution=3600`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = await r.json();
        const rows = d.result && d.result.data;
        if (!Array.isArray(rows) || rows.length === 0) throw new Error('No DVOL data');
        const latest = rows[rows.length - 1];
        const close = latest[4]; // [timestamp, open, high, low, close]
        if (!Number.isFinite(close)) throw new Error('Invalid DVOL value');
        apiCache.dvol = { data: close, timestamp: Date.now() };
        renderDVOL(close);
    } catch (e) {
        console.error('DVOL fetch error:', e);
        document.getElementById('btcVolatility').textContent = 'Unavailable';
        document.getElementById('btcVolatilityDesc').textContent = 'Deribit DVOL, annualized';
    }
}

async function fetchHistoricalData() {
    try {
        const fgiResponse = await fetch('https://api.alternative.me/fng/?limit=30&format=json');
        if (!fgiResponse.ok) throw new Error(`HTTP ${fgiResponse.status}`);
        const fgiData = await fgiResponse.json();
        if (!fgiData.data || !Array.isArray(fgiData.data) || fgiData.data.length === 0) {
            throw new Error('No historical data available');
        }

        // BTC overlay is optional: the FGI charts render even if this fails
        let btcHistory = [];
        try {
            const btcResponse = await fetch('https://min-api.cryptocompare.com/data/v2/histoday?fsym=BTC&tsym=USD&limit=30');
            if (btcResponse.ok) {
                const btcData = await btcResponse.json();
                if (btcData.Data && btcData.Data.Data) btcHistory = btcData.Data.Data;
            }
        } catch (btcErr) {
            console.error('BTC history error (rendering FGI only):', btcErr);
        }

        const fgiHistory = fgiData.data.reverse();
        const history = fgiHistory.map(item => {
            const btcItem = btcHistory.find(b => b.time === parseInt(item.timestamp));
            return {
                date: new Date(item.timestamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                score: parseInt(item.value),
                timestamp: item.timestamp,
                btcPrice: btcItem ? btcItem.close : null
            };
        });
        document.getElementById('chartTitle').textContent = '30-Day Sentiment History';
        renderChart(history);
        renderDistributionChart(history);
    } catch (e) {
        console.error('History error:', e);
        document.getElementById('chartTitle').innerHTML =
            '30-Day Sentiment History <span style="color:#f85149">(connection error)</span>';
    }
}

function renderDistributionChart(history) {
    const el = document.getElementById('distributionChart');
    if (!el || typeof Chart === 'undefined') return;

    const counts = [0, 0, 0, 0, 0];
    history.forEach(item => {
        const idx = ZONES.indexOf(getZone(item.score));
        counts[idx]++;
    });

    const total = history.length;
    const percentages = counts.map(val => ((val / total) * 100).toFixed(1));

    if (window.distributionChartInstance) {
        window.distributionChartInstance.destroy();
    }

    const ctx = el.getContext('2d');
    window.distributionChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ZONES.map((z, i) => `${z.name} (${percentages[i]}%)`),
            datasets: [{
                data: counts,
                backgroundColor: ZONES.map(z => z.color),
                borderColor: COLORS.surface,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: COLORS.secondary,
                        font: { size: 12, family: 'Inter' },
                        padding: 12,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: COLORS.raised,
                    titleColor: COLORS.text,
                    bodyColor: COLORS.secondary,
                    borderColor: COLORS.border,
                    borderWidth: 1,
                    padding: 10,
                    titleFont: { family: 'Inter', size: 13 },
                    bodyFont: { family: MONO, size: 12 },
                    callbacks: {
                        label: function (context) {
                            return ` ${context.parsed} days (${percentages[context.dataIndex]}%)`;
                        }
                    }
                }
            }
        }
    });
}

function renderChart(h) {
    const el = document.getElementById('historyChart');
    if (!el || typeof Chart === 'undefined') return;
    const c = el.getContext('2d');
    if (window.chartInstance) window.chartInstance.destroy();
    const isMobile = window.innerWidth <= 768;
    const hasBTC = h.some(d => d.btcPrice !== null);
    try {
        const datasets = [
            {
                label: 'Fear & Greed',
                data: h.map(d => d.score),
                borderColor: COLORS.accent,
                backgroundColor: 'rgba(247, 147, 26, 0.08)',
                borderWidth: 2,
                tension: 0.3,
                fill: true,
                pointBackgroundColor: h.map(d => getColorForScore(d.score)),
                pointBorderColor: COLORS.surface,
                pointBorderWidth: 1,
                pointRadius: isMobile ? 2 : 3,
                pointHoverRadius: isMobile ? 4 : 5,
                yAxisID: 'y'
            }
        ];
        if (hasBTC) {
            datasets.push({
                label: 'BTC Price',
                data: h.map(d => d.btcPrice),
                borderColor: COLORS.secondary,
                borderWidth: 1.5,
                tension: 0.3,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: isMobile ? 3 : 4,
                pointBackgroundColor: COLORS.secondary,
                yAxisID: 'y1'
            });
        }
        window.chartInstance = new Chart(c, {
            type: 'line',
            data: {
                labels: h.map(d => d.date),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: {
                        labels: {
                            color: COLORS.secondary,
                            font: { family: 'Inter', size: isMobile ? 11 : 12 },
                            usePointStyle: true,
                            pointStyle: 'line'
                        }
                    },
                    tooltip: {
                        backgroundColor: COLORS.raised,
                        titleColor: COLORS.text,
                        bodyColor: COLORS.secondary,
                        borderColor: COLORS.border,
                        borderWidth: 1,
                        padding: 10,
                        titleFont: { family: 'Inter', size: 13 },
                        bodyFont: { family: MONO, size: 12 },
                        callbacks: {
                            title: function (context) { return context[0].label; },
                            label: function (context) {
                                if (context.dataset.label === 'Fear & Greed') {
                                    const score = context.parsed.y;
                                    return getSentimentCategory(score) + ': ' + score + '/100';
                                }
                                return 'BTC: $' + context.parsed.y.toLocaleString('en-US', { maximumFractionDigits: 0 });
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        position: 'left',
                        beginAtZero: true,
                        max: 100,
                        grid: { color: COLORS.grid },
                        ticks: { color: COLORS.secondary, font: { family: MONO, size: isMobile ? 9 : 11 } },
                        title: { display: !isMobile, text: 'FGI Score', color: COLORS.secondary, font: { family: 'Inter', size: 11 } }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        display: hasBTC,
                        grid: { display: false },
                        ticks: {
                            color: COLORS.muted,
                            font: { family: MONO, size: isMobile ? 9 : 11 },
                            callback: function (value) { return '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 }); }
                        },
                        title: { display: !isMobile && hasBTC, text: 'BTC Price', color: COLORS.muted, font: { family: 'Inter', size: 11 } }
                    },
                    x: {
                        grid: { color: COLORS.grid },
                        ticks: {
                            color: COLORS.muted,
                            font: { family: MONO, size: isMobile ? 8 : 10 },
                            maxRotation: 45,
                            minRotation: 45,
                            autoSkip: true,
                            maxTicksLimit: isMobile ? 8 : 15
                        }
                    }
                }
            }
        });
    } catch (e) { console.error('Chart error:', e); }
}

// ── Sentiment streak ─────────────────────────────────────────────
async function fetchHistoricalStreakData() {
    try {
        const r = await fetch('https://api.alternative.me/fng/?limit=365&format=json');
        const d = await r.json();
        if (!d.data || !Array.isArray(d.data)) {
            throw new Error('Invalid historical data');
        }
        return d.data; // Newest first (index 0 = today)
    } catch (e) {
        console.error('Historical streak data fetch error:', e);
        return null;
    }
}

function calculateCurrentStreak(historicalData, currentCategory) {
    let streak = 0;
    for (let i = 0; i < historicalData.length; i++) {
        const score = parseInt(historicalData[i].value);
        const category = getSentimentCategory(score);
        if (category === currentCategory) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

function calculateHistoricalStats(historicalData) {
    const categories = ZONES.map(z => z.name);
    const stats = {};

    categories.forEach(cat => {
        stats[cat] = { longestStreak: 0, totalDays: 0, streakCount: 0, recordDate: null };
    });

    let currentCat = null;
    let currentStreakLen = 0;
    let streakStartIndex = 0;

    for (let i = historicalData.length - 1; i >= 0; i--) { // oldest to newest
        const score = parseInt(historicalData[i].value);
        const category = getSentimentCategory(score);

        if (category === currentCat) {
            currentStreakLen++;
        } else {
            // The final (ongoing) streak is intentionally never saved; only completed streaks count
            if (currentCat && currentStreakLen > 0) {
                if (currentStreakLen > stats[currentCat].longestStreak) {
                    stats[currentCat].longestStreak = currentStreakLen;
                    stats[currentCat].recordDate = historicalData[streakStartIndex].timestamp;
                }
                stats[currentCat].totalDays += currentStreakLen;
                stats[currentCat].streakCount++;
            }
            currentCat = category;
            currentStreakLen = 1;
            streakStartIndex = i;
        }
    }

    categories.forEach(cat => {
        if (stats[cat].streakCount > 0) {
            stats[cat].average = Math.round((stats[cat].totalDays / stats[cat].streakCount) * 10) / 10;
        } else {
            stats[cat].average = 0;
        }
    });

    return stats;
}

function formatRecordDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(parseInt(timestamp) * 1000);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

async function updateStreakDisplay(currentScore) {
    try {
        const historicalData = await fetchHistoricalStreakData();
        if (!historicalData || historicalData.length === 0) {
            document.getElementById('streakInfo').textContent = '';
            return;
        }

        const currentCategory = getSentimentCategory(currentScore);
        const currentStreak = calculateCurrentStreak(historicalData, currentCategory);
        const stats = calculateHistoricalStats(historicalData);

        const catStats = stats[currentCategory];
        const record = catStats.longestStreak;
        const average = catStats.average;
        const recordDate = catStats.recordDate;

        // Stat card
        document.getElementById('streakLabelInline').textContent = `${currentCategory} Streak`;
        const streakValueEl = document.getElementById('streakValueInline');
        streakValueEl.textContent = currentStreak;
        let descText;
        const categoryLower = currentCategory.toLowerCase();
        if (currentStreak === 0) {
            descText = `No active ${categoryLower} streak`;
        } else if (currentStreak === 1) {
            descText = `Day 1 of ${categoryLower}`;
        } else {
            descText = `${currentStreak} consecutive days of ${categoryLower}`;
        }
        document.getElementById('streakDescInline').textContent = descText;

        // Hero streak line
        const streakInfoEl = document.getElementById('streakInfo');
        const recordDateStr = recordDate ? ` in ${formatRecordDate(recordDate)}` : '';
        if (currentStreak > record) {
            streakInfoEl.textContent = `Day ${currentStreak} of ${currentCategory}, a new record${record > 0 ? ` (previous: ${record} days${recordDateStr})` : ''}`;
        } else if (currentStreak === 1) {
            streakInfoEl.textContent = `Day 1 of ${currentCategory}`;
        } else {
            streakInfoEl.textContent = `Day ${currentStreak} of ${currentCategory} (avg ${average} days · record ${record} days${recordDateStr})`;
        }
    } catch (e) {
        console.error('Streak display error:', e);
        document.getElementById('streakInfo').textContent = '';
    }
}

// ── FGI hero ─────────────────────────────────────────────────────
async function fetchData() {
    try {
        // limit=2 so we can show the change vs yesterday
        const r = await fetch('https://api.alternative.me/fng/?limit=2&format=json');
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = await r.json();
        if (!d.data || !d.data[0]) { throw new Error('Invalid API response'); }
        const fgiData = d.data[0];
        const parsedScore = parseInt(fgiData.value);
        if (!Number.isFinite(parsedScore) || parsedScore < 0 || parsedScore > 100) {
            throw new Error('Invalid FGI value: ' + fgiData.value);
        }
        const isFirstLoad = currentScore === null;
        currentScore = parsedScore;
        const zone = getZone(currentScore);

        // Score + zone chip. First load counts up; subsequent refreshes set directly.
        if (isFirstLoad) {
            animateScoreCountUp(currentScore);
        } else {
            document.getElementById('fgiScore').textContent = currentScore;
        }
        const statusEl = document.getElementById('fgiStatus');
        statusEl.textContent = zone.name;
        statusEl.className = 'zone-chip ' + zone.cls;

        // Delta vs yesterday
        const deltaEl = document.getElementById('fgiDelta');
        if (d.data[1]) {
            const prev = parseInt(d.data[1].value);
            const delta = currentScore - prev;
            deltaEl.textContent = (delta >= 0 ? '+' : '') + delta + ' vs yesterday';
            deltaEl.className = 'fgi-delta ' + (delta >= 0 ? 'up' : 'down');
        } else {
            deltaEl.textContent = '';
        }

        // Gauge: slow deliberate sweep on first load, normal snap on refresh
        if (isFirstLoad) animateGaugeEntrance();
        document.getElementById('gaugeMarker').style.left = currentScore + '%';
        document.querySelectorAll('.gauge-seg').forEach(seg => seg.classList.remove('active'));
        const activeSeg = document.querySelector('.gauge-seg.seg-' + zone.cls.replace('zone-', ''));
        if (activeSeg) activeSeg.classList.add('active');

        // Signal + timestamp (FGI updates daily at 00:00 UTC)
        document.getElementById('degenStatus').textContent = SIGNAL_MAP[zone.name] || zone.name;
        const updated = new Date(fgiData.timestamp * 1000);
        document.getElementById('timestamp').textContent =
            'Updated ' + updated.toISOString().slice(0, 10) + ' ' + updated.toISOString().slice(11, 16) + ' UTC';

        if (isFirstLoad) revealEntrance();

        await updateStreakDisplay(currentScore);

        if (portfolioData) {
            updatePortfolioAdvice();
        }
    } catch (e) {
        console.error('Data fetch error:', e);
        document.getElementById('fgiStatus').textContent = 'Connection error';
        document.getElementById('fgiStatus').className = 'zone-chip';
        document.getElementById('degenStatus').textContent = 'Data unavailable. Retry.';
        revealEntrance(); // don't leave the page invisible on a failed first load
    }
}

function shareToX() {
    if (currentScore === null) return; // no data yet, nothing truthful to share
    const zone = getZone(currentScore);
    const t = 'Crypto Fear & Greed Index: ' + currentScore + '/100 (' + zone.name + ')\n\n' +
        (SIGNAL_MAP[zone.name] || '') + '\n\nLive data:';
    window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(t) + '&url=' + encodeURIComponent(window.location.href), '_blank', 'width=550,height=420');
}

// Header UTC clock
function tickClock() {
    const el = document.getElementById('utcClock');
    if (!el) return;
    el.textContent = new Date().toISOString().slice(11, 19) + ' UTC';
}
tickClock();
setInterval(tickClock, 1000);

function refreshAll() {
    fetchData();
    fetchBTCPrice();
    fetchBTCDominance();
    fetchBTCMarketCap();
    fetchDVOL();
    fetchHistoricalData();
}

// Initial load: all data fetches immediately (no spin gate)
refreshAll();

// ── Sentiment poll ─────────────────────────────────────────────────
(function () {
    const VOTE_STORAGE_KEY = 'fgi_last_vote';
    const VISITOR_ID_KEY = 'fgi_visitor_id';

    const bullishBtn = document.getElementById('pollBullishBtn');
    const bearishBtn = document.getElementById('pollBearishBtn');
    const barBullish = document.getElementById('pollBarBullish');
    const barBearish = document.getElementById('pollBarBearish');
    const resultEl = document.getElementById('pollResult');

    if (!bullishBtn || !bearishBtn) return; // panel not on this page

    function getVisitorId() {
        let id = localStorage.getItem(VISITOR_ID_KEY);
        if (!id) {
            id = (window.crypto && crypto.randomUUID)
                ? crypto.randomUUID()
                : 'v-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
            localStorage.setItem(VISITOR_ID_KEY, id);
        }
        return id;
    }

    function todayUTC() {
        return new Date().toISOString().slice(0, 10);
    }

    function getStoredVote() {
        try {
            const raw = localStorage.getItem(VOTE_STORAGE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (parsed.date !== todayUTC()) return null; // stored vote is stale
            return parsed.vote === 'bullish' || parsed.vote === 'bearish' ? parsed.vote : null;
        } catch (e) {
            return null;
        }
    }

    function storeVote(vote) {
        localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify({ date: todayUTC(), vote }));
    }

    function renderCounts(bullish, bearish) {
        const total = bullish + bearish;
        const bullishPct = total > 0 ? Math.round((bullish / total) * 100) : 50;
        const bearishPct = total > 0 ? 100 - bullishPct : 50;
        barBullish.style.width = bullishPct + '%';
        barBearish.style.width = bearishPct + '%';
        resultEl.textContent = total > 0
            ? bullishPct + '% Bullish · ' + bearishPct + '% Bearish · ' + total.toLocaleString() + ' votes today'
            : 'No votes yet today — be the first';
    }

    function markVoted(vote) {
        bullishBtn.classList.toggle('active', vote === 'bullish');
        bearishBtn.classList.toggle('active', vote === 'bearish');
        bullishBtn.setAttribute('aria-pressed', String(vote === 'bullish'));
        bearishBtn.setAttribute('aria-pressed', String(vote === 'bearish'));
    }

    async function submitVote(vote) {
        bullishBtn.disabled = true;
        bearishBtn.disabled = true;
        try {
            const r = await fetch('/api/sentiment-poll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vote, deviceId: getVisitorId() })
            });
            if (!r.ok) throw new Error('HTTP ' + r.status);
            const data = await r.json();
            renderCounts(data.bullish, data.bearish);
            storeVote(vote);
            markVoted(vote);
        } catch (e) {
            console.error('Poll vote error:', e);
            resultEl.textContent = 'Vote unavailable. Try again later.';
        } finally {
            bullishBtn.disabled = false;
            bearishBtn.disabled = false;
        }
    }

    async function loadPollResults() {
        try {
            const r = await fetch('/api/sentiment-poll');
            if (!r.ok) throw new Error('HTTP ' + r.status);
            const data = await r.json();
            renderCounts(data.bullish, data.bearish);
        } catch (e) {
            console.error('Poll load error:', e);
            resultEl.textContent = 'Votes unavailable.';
        }
        const existingVote = getStoredVote();
        if (existingVote) markVoted(existingVote);
    }

    bullishBtn.addEventListener('click', () => submitVote('bullish'));
    bearishBtn.addEventListener('click', () => submitVote('bearish'));

    loadPollResults();
})();

// ── Portfolio ────────────────────────────────────────────────────
// Schema v2: { schemaVersion: 2, holdings: [{coinId, symbol, name, image, amount}], stablecoins }
let portfolioData = null;
let allocationChartInstance = null;
let showMigrationNoticeOnOpen = false;
const PORTFOLIO_SLICE_COLORS = [COLORS.accent, '#8b5cf6', '#3fb950', '#58a6ff', '#d29922', '#f85149', '#2ea043', '#db6d28'];

function migrateLegacyPortfolio(parsed) {
    // Old shape: {crypto, stablecoins} — a lump dollar total with no coin identity.
    // Can't be un-mixed into real holdings, so it's dropped; stablecoins carries over.
    const stablecoins = Number(parsed.stablecoins);
    showMigrationNoticeOnOpen = true;
    return {
        schemaVersion: 2,
        holdings: [],
        stablecoins: Number.isFinite(stablecoins) ? stablecoins : 0
    };
}

function loadPortfolio() {
    try {
        const saved = localStorage.getItem('portfolio');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (!parsed || typeof parsed !== 'object') throw new Error('Invalid portfolio data');

            if (parsed.schemaVersion !== 2 || !Array.isArray(parsed.holdings)) {
                if (typeof parsed.crypto === 'number' && !parsed.holdings) {
                    portfolioData = migrateLegacyPortfolio(parsed);
                    localStorage.setItem('portfolio', JSON.stringify(portfolioData));
                    return portfolioData;
                }
                throw new Error('Unrecognized portfolio schema');
            }

            const stablecoins = Number(parsed.stablecoins);
            const holdings = parsed.holdings
                .filter(h => h && typeof h.coinId === 'string' && Number.isFinite(Number(h.amount)))
                .map(h => ({
                    coinId: h.coinId,
                    symbol: String(h.symbol || '').slice(0, 12),
                    name: String(h.name || h.coinId).slice(0, 60),
                    image: typeof h.image === 'string' ? h.image : null,
                    amount: Number(h.amount)
                }));

            portfolioData = {
                schemaVersion: 2,
                holdings,
                stablecoins: Number.isFinite(stablecoins) ? stablecoins : 0
            };
            return portfolioData;
        }
    } catch (e) {
        console.error('Corrupt portfolio in localStorage, clearing:', e);
        localStorage.removeItem('portfolio');
        portfolioData = null;
    }
    return null;
}

function savePortfolioState() {
    localStorage.setItem('portfolio', JSON.stringify(portfolioData));
}

function ensurePortfolioData() {
    if (!portfolioData) portfolioData = { schemaVersion: 2, holdings: [], stablecoins: 0 };
    return portfolioData;
}

function savePortfolio() {
    const stablecoins = parseFloat(document.getElementById('stablesInput').value) || 0;
    if (stablecoins < 0) {
        alert('Please enter a positive value for cash.');
        return;
    }

    const data = ensurePortfolioData();
    if (data.holdings.length === 0 && stablecoins === 0) {
        alert('Add at least one holding or a cash balance.');
        return;
    }

    data.stablecoins = stablecoins;
    savePortfolioState();

    renderAllocationChart();
    updatePortfolioAdvice();
}

// Live prices keyed by coinId, populated by fetchPortfolioPrices()
let portfolioPrices = {};

async function fetchPortfolioPrices(coinIds) {
    if (coinIds.length === 0) return {};
    try {
        const r = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}&order=market_cap_desc&per_page=250&page=1&sparkline=false`, {
            headers: { 'Accept': 'application/json' }
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const rows = await r.json();
        const prices = {};
        rows.forEach(row => { prices[row.id] = row.current_price; });
        portfolioPrices = prices;
        return prices;
    } catch (e) {
        console.error('Portfolio price fetch error:', e);
        return portfolioPrices; // keep last-known prices rather than zeroing everything out
    }
}

function calculateAllocation() {
    if (!portfolioData) return null;
    const holdingValues = portfolioData.holdings.map(h => ({
        ...h,
        price: portfolioPrices[h.coinId] || 0,
        value: h.amount * (portfolioPrices[h.coinId] || 0)
    }));
    const cryptoTotal = holdingValues.reduce((sum, h) => sum + h.value, 0);
    const total = cryptoTotal + portfolioData.stablecoins;
    if (total === 0) return null;
    return {
        holdingValues,
        cryptoTotal,
        cryptoRatio: cryptoTotal / total,
        stablesRatio: portfolioData.stablecoins / total,
        total
    };
}

function getPortfolioAdvice(fgiScore, cryptoRatio) {
    if (fgiScore <= 24 && cryptoRatio < 0.3) {
        return { text: 'Sentiment is at extreme fear while your cash allocation is high. Historically an attractive entry point.', color: COLORS.up };
    }
    if (fgiScore >= 80 && cryptoRatio > 0.7) {
        return { text: 'Sentiment is at extreme greed while your crypto exposure is high. Consider reducing risk.', color: COLORS.down };
    }
    if (fgiScore <= 44 && cryptoRatio < 0.4) {
        return { text: 'Sentiment is fearful and your crypto allocation is low. A measured increase may be reasonable.', color: COLORS.up };
    }
    if (fgiScore >= 60 && cryptoRatio > 0.6) {
        return { text: 'Sentiment is elevated and your crypto exposure is above 60%. Consider taking some profits.', color: '#d29922' };
    }
    return { text: 'Your allocation is balanced for current sentiment.', color: COLORS.secondary };
}

function updatePortfolioAdvice() {
    const allocation = calculateAllocation();
    if (!allocation || currentScore === null) return;

    const advice = getPortfolioAdvice(currentScore, allocation.cryptoRatio);
    const adviceCardElement = document.getElementById('portfolioAdviceCard');
    const adviceText = document.getElementById('adviceText');

    adviceText.textContent = advice.text;
    adviceText.style.color = advice.color;
    if (adviceCardElement) adviceCardElement.style.display = 'block';
}

function renderAllocationChart() {
    if (!portfolioData || typeof Chart === 'undefined') return;
    const allocation = calculateAllocation();
    if (!allocation) return;

    document.getElementById('portfolioChart').style.display = 'block';
    const ctx = document.getElementById('allocationChart').getContext('2d');

    if (allocationChartInstance) {
        allocationChartInstance.destroy();
    }

    const labels = allocation.holdingValues.map(h => h.symbol.toUpperCase() || h.name);
    const data = allocation.holdingValues.map(h => h.value);
    const colors = allocation.holdingValues.map((_, i) => PORTFOLIO_SLICE_COLORS[i % PORTFOLIO_SLICE_COLORS.length]);
    if (portfolioData.stablecoins > 0) {
        labels.push('Cash');
        data.push(portfolioData.stablecoins);
        colors.push(COLORS.border);
    }

    allocationChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors,
                borderColor: COLORS.surface,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: COLORS.secondary,
                        font: { family: 'Inter', size: 12 },
                        padding: 12,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            }
        }
    });

    const rows = allocation.holdingValues.map(h => `
        <div class="stat-item">
            <span class="stat-label">${h.symbol.toUpperCase() || h.name}</span>
            <span class="stat-value">$${h.value.toLocaleString(undefined, { maximumFractionDigits: 0 })} (${((h.value / allocation.total) * 100).toFixed(1)}%)</span>
        </div>
    `).join('');
    const stableRow = portfolioData.stablecoins > 0 ? `
        <div class="stat-item">
            <span class="stat-label">Cash</span>
            <span class="stat-value">$${portfolioData.stablecoins.toLocaleString()} (${(allocation.stablesRatio * 100).toFixed(1)}%)</span>
        </div>
    ` : '';
    const statsHTML = rows + stableRow + `
        <div class="stat-item" style="border-top:1px solid #30363d;padding-top:8px;">
            <span class="stat-label">Total</span>
            <span class="stat-value">$${allocation.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
    `;
    document.getElementById('allocationStats').innerHTML = statsHTML;
}

// ── Holdings table + coin search ──────────────────────────────────
function coinLogoHTML(coin) {
    const badge = (coin.symbol || '?').slice(0, 4);
    if (coin.image) {
        // data-badge lets a delegated 'error' listener swap in the fallback
        // without building nested HTML inside an inline onerror attribute
        // (that quoting collision is a real bug — see handleCoinLogoError).
        return `<img class="coin-logo" src="${coin.image}" alt="" loading="lazy" data-badge="${badge}">`;
    }
    return `<span class="coin-logo-fallback">${badge}</span>`;
}

// Delegated fallback for broken/missing coin logos (capture phase: 'error'
// on <img> doesn't bubble, so it must be caught during capture).
document.addEventListener('error', function (e) {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || !img.classList.contains('coin-logo')) return;
    const span = document.createElement('span');
    span.className = 'coin-logo-fallback';
    span.textContent = img.dataset.badge || '?';
    img.replaceWith(span);
}, true);

function renderHoldingsTable() {
    const tbody = document.getElementById('holdingsTableBody');
    const data = ensurePortfolioData();

    if (data.holdings.length === 0) {
        tbody.innerHTML = '<tr id="holdingsEmptyRow"><td colspan="5" class="holdings-empty">No holdings added yet</td></tr>';
        return;
    }

    tbody.innerHTML = data.holdings.map((h, i) => {
        const price = portfolioPrices[h.coinId];
        const priceText = typeof price === 'number' ? '$' + price.toLocaleString(undefined, { maximumFractionDigits: price < 1 ? 4 : 2 }) : '--';
        const value = typeof price === 'number' ? h.amount * price : null;
        const valueText = value !== null ? '$' + value.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '--';
        return `
            <tr data-index="${i}">
                <td><div class="coin-cell">${coinLogoHTML(h)}<span>${h.name}<br><span class="coin-symbol">${h.symbol.toUpperCase()}</span></span></div></td>
                <td><input type="number" class="holdings-amount-input" data-index="${i}" value="${h.amount}" min="0" step="any"></td>
                <td>${priceText}</td>
                <td>${valueText}</td>
                <td><button class="holdings-remove-btn" data-index="${i}" aria-label="Remove ${h.name}">&times;</button></td>
            </tr>
        `;
    }).join('');
}

async function refreshHoldingsPricesAndRender() {
    const data = ensurePortfolioData();
    const coinIds = data.holdings.map(h => h.coinId);
    await fetchPortfolioPrices(coinIds);
    renderHoldingsTable();
    renderAllocationChart();
    updatePortfolioAdvice();
}

function addHolding(coin) {
    const data = ensurePortfolioData();
    if (data.holdings.some(h => h.coinId === coin.id)) {
        // Already added — just focus its amount input instead of duplicating
        const idx = data.holdings.findIndex(h => h.coinId === coin.id);
        renderHoldingsTable();
        const input = document.querySelector(`.holdings-amount-input[data-index="${idx}"]`);
        if (input) input.focus();
        return;
    }
    data.holdings.push({
        coinId: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        image: coin.image || coin.thumb || null,
        amount: 0
    });
    savePortfolioState();
    refreshHoldingsPricesAndRender();
}

function removeHolding(index) {
    const data = ensurePortfolioData();
    data.holdings.splice(index, 1);
    savePortfolioState();
    refreshHoldingsPricesAndRender();
}

function updateHoldingAmount(index, amount) {
    const data = ensurePortfolioData();
    if (!data.holdings[index]) return;
    data.holdings[index].amount = Number.isFinite(amount) && amount >= 0 ? amount : 0;
    savePortfolioState();
    renderHoldingsTable();
    renderAllocationChart();
    updatePortfolioAdvice();
}

// Coin search: debounced CoinGecko /search, results shown in a dropdown
let coinSearchDebounce = null;
async function searchCoins(query) {
    try {
        const r = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`, {
            headers: { 'Accept': 'application/json' }
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        return Array.isArray(data.coins) ? data.coins.slice(0, 8) : [];
    } catch (e) {
        console.error('Coin search error:', e);
        return [];
    }
}

function initCoinSearch() {
    const input = document.getElementById('coinSearchInput');
    const results = document.getElementById('coinSearchResults');
    if (!input || !results) return;

    input.addEventListener('input', () => {
        const query = input.value.trim();
        clearTimeout(coinSearchDebounce);
        if (query.length < 2) {
            results.style.display = 'none';
            results.innerHTML = '';
            return;
        }
        coinSearchDebounce = setTimeout(async () => {
            const coins = await searchCoins(query);
            if (coins.length === 0) {
                results.innerHTML = '<div class="coin-search-empty">No coins found</div>';
            } else {
                results.innerHTML = coins.map(c => `
                    <div class="coin-search-result" data-id="${c.id}" data-symbol="${c.symbol}" data-name="${c.name.replace(/"/g, '&quot;')}" data-image="${c.thumb || ''}">
                        ${coinLogoHTML({ image: c.thumb, symbol: c.symbol })}
                        <span>${c.name} <span class="coin-symbol">${c.symbol.toUpperCase()}</span></span>
                    </div>
                `).join('');
            }
            results.style.display = 'block';
        }, 300);
    });

    results.addEventListener('click', (e) => {
        const row = e.target.closest('.coin-search-result');
        if (!row) return;
        addHolding({
            id: row.dataset.id,
            symbol: row.dataset.symbol,
            name: row.dataset.name,
            image: row.dataset.image
        });
        input.value = '';
        results.style.display = 'none';
        results.innerHTML = '';
    });

    document.addEventListener('click', (e) => {
        if (e.target !== input && !results.contains(e.target)) {
            results.style.display = 'none';
        }
    });
}

function initHoldingsTableEvents() {
    const tbody = document.getElementById('holdingsTableBody');
    if (!tbody) return;

    tbody.addEventListener('click', (e) => {
        const btn = e.target.closest('.holdings-remove-btn');
        if (!btn) return;
        removeHolding(parseInt(btn.dataset.index, 10));
    });

    tbody.addEventListener('change', (e) => {
        if (!e.target.classList.contains('holdings-amount-input')) return;
        const index = parseInt(e.target.dataset.index, 10);
        updateHoldingAmount(index, parseFloat(e.target.value));
    });
}

function initPortfolioModal() {
    const modal = document.getElementById('portfolioModal');
    const portfolioBtn = document.getElementById('portfolioToggle');
    const closeBtn = modal.querySelector('.close');
    const saveBtn = document.getElementById('savePortfolioBtn');

    if (!modal || !portfolioBtn || !closeBtn || !saveBtn) {
        console.error('Portfolio modal elements not found');
        return;
    }

    initCoinSearch();
    initHoldingsTableEvents();

    portfolioBtn.addEventListener('click', async function () {
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        portfolioBtn.setAttribute('aria-pressed', 'true');

        const notice = document.getElementById('portfolioMigrationNotice');
        if (notice) notice.style.display = showMigrationNoticeOnOpen ? 'block' : 'none';
        showMigrationNoticeOnOpen = false;

        const saved = loadPortfolio();
        if (saved) {
            document.getElementById('stablesInput').value = saved.stablecoins || '';
            renderHoldingsTable();
            await refreshHoldingsPricesAndRender();
        } else {
            renderHoldingsTable();
        }
        document.getElementById('coinSearchInput').focus();
    });

    const closeModal = function () {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        portfolioBtn.setAttribute('aria-pressed', 'false');
        portfolioBtn.focus();
    };

    closeBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            closeModal();
        }
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
    saveBtn.addEventListener('click', savePortfolio);
    window.addEventListener('click', function (event) {
        if (event.target == modal) {
            closeModal();
        }
    });
}

loadPortfolio();
initPortfolioModal();

// ── Backtester modal ─────────────────────────────────────────────
function initBacktesterModal() {
    const modal = document.getElementById('backtesterModal');
    const backtesterBtn = document.getElementById('backtesterToggle');
    const closeBtn = modal?.querySelector('.close');

    if (!modal || !backtesterBtn || !closeBtn) {
        console.error('Backtester modal elements not found');
        return;
    }

    const strategyData = {
        greed: {
            1: {roi: 1.38, samples: 92, winRate: 63.0, days: 100.0},
            2: {roi: 1.95, samples: 61, winRate: 65.6, days: 103.2},
            3: {roi: 2.44, samples: 41, winRate: 68.3, days: 104.4},
            4: {roi: 5.52, samples: 31, winRate: 64.5, days: 110.5},
            5: {roi: 5.06, samples: 26, winRate: 69.2, days: 110.3},
            6: {roi: 9.46, samples: 23, winRate: 69.6, days: 100.2},
            7: {roi: 5.55, samples: 19, winRate: 68.4, days: 113.2},
            8: {roi: 7.95, samples: 15, winRate: 66.7, days: 117.3},
            9: {roi: 8.12, samples: 13, winRate: 61.5, days: 112.9},
            10: {roi: 8.22, samples: 12, winRate: 58.3, days: 115.8},
            11: {roi: 5.65, samples: 12, winRate: 58.3, days: 114.8},
            12: {roi: 13.02, samples: 10, winRate: 70.0, days: 102.8},
            13: {roi: 12.76, samples: 9, winRate: 66.7, days: 112.4},
            14: {roi: 15.25, samples: 9, winRate: 77.8, days: 111.4},
            15: {roi: 20.27, samples: 8, winRate: 75.0, days: 103.4},
            16: {roi: 16.43, samples: 7, winRate: 85.7, days: 107.9},
            17: {roi: 15.76, samples: 6, winRate: 83.3, days: 105.2},
            18: {roi: 19.14, samples: 6, winRate: 83.3, days: 104.2},
            19: {roi: 21.31, samples: 5, winRate: 80.0, days: 121.6},
            20: {roi: 22.58, samples: 4, winRate: 75.0, days: 126.8}
        },
        extremeGreed: {
            1: {roi: 69.26, samples: 88, winRate: 100.0, days: 393.3},
            2: {roi: 74.96, samples: 57, winRate: 100.0, days: 357.3},
            3: {roi: 83.74, samples: 39, winRate: 100.0, days: 343.1},
            4: {roi: 93.42, samples: 30, winRate: 100.0, days: 348.8},
            5: {roi: 94.87, samples: 26, winRate: 100.0, days: 364.1},
            6: {roi: 102.18, samples: 23, winRate: 100.0, days: 334.2},
            7: {roi: 102.09, samples: 19, winRate: 100.0, days: 339.7},
            8: {roi: 103.53, samples: 15, winRate: 100.0, days: 359.3},
            9: {roi: 109.50, samples: 13, winRate: 100.0, days: 369.4},
            10: {roi: 112.47, samples: 12, winRate: 100.0, days: 386.9},
            11: {roi: 109.94, samples: 12, winRate: 100.0, days: 385.9},
            12: {roi: 121.08, samples: 10, winRate: 100.0, days: 404.5},
            13: {roi: 126.33, samples: 9, winRate: 100.0, days: 438.7},
            14: {roi: 129.56, samples: 9, winRate: 100.0, days: 437.7},
            15: {roi: 139.61, samples: 8, winRate: 100.0, days: 455.6},
            16: {roi: 118.24, samples: 7, winRate: 100.0, days: 454.1},
            17: {roi: 102.35, samples: 6, winRate: 100.0, days: 443.5},
            18: {roi: 108.47, samples: 6, winRate: 100.0, days: 442.5},
            19: {roi: 125.97, samples: 5, winRate: 100.0, days: 444.2},
            20: {roi: 102.42, samples: 4, winRate: 100.0, days: 431.5}
        }
    };

    let selectedDay = 1;
    let investmentAmount = 1000;

    const daySlider = modal.querySelector('#daySlider');
    const dayValue = modal.querySelector('#dayValue');
    if (daySlider && dayValue) {
        daySlider.addEventListener('input', (e) => {
            selectedDay = parseInt(e.target.value);
            dayValue.textContent = selectedDay;
            updateDisplay();
        });
    }

    function updateDisplay() {
        const greed = strategyData.greed[selectedDay];
        const xgreed = strategyData.extremeGreed[selectedDay];

        modal.querySelector('#greed-samples').textContent = `${greed.samples} trades`;
        modal.querySelector('#greed-roi').textContent = `+${greed.roi.toFixed(2)}%`;
        modal.querySelector('#greed-winrate').textContent = `${greed.winRate.toFixed(1)}%`;
        modal.querySelector('#greed-days').textContent = `~${Math.round(greed.days)} days`;
        modal.querySelector('#greed-profit').textContent = `$${Math.round(investmentAmount * (1 + greed.roi / 100)).toLocaleString()}`;

        modal.querySelector('#xgreed-samples').textContent = `${xgreed.samples} trades`;
        modal.querySelector('#xgreed-roi').textContent = `+${xgreed.roi.toFixed(2)}%`;
        modal.querySelector('#xgreed-winrate').textContent = `${xgreed.winRate.toFixed(1)}%`;
        modal.querySelector('#xgreed-days').textContent = `~${Math.round(xgreed.days)} days`;
        modal.querySelector('#xgreed-profit').textContent = `$${Math.round(investmentAmount * (1 + xgreed.roi / 100)).toLocaleString()}`;

        modal.querySelector('#hodl-invest').textContent = `$${investmentAmount.toLocaleString()}`;
        modal.querySelector('#hodl-profit').textContent = `$${Math.round(investmentAmount * (1 - 0.0113)).toLocaleString()}`;
    }

    const slider = modal.querySelector('#investmentSlider');
    const valueDisplay = modal.querySelector('#investmentValue');

    slider.addEventListener('input', function () {
        investmentAmount = parseInt(this.value);
        valueDisplay.textContent = investmentAmount.toLocaleString();
        updateDisplay();
    });

    backtesterBtn.addEventListener('click', function () {
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        backtesterBtn.setAttribute('aria-pressed', 'true');
        updateDisplay();
    });

    const closeModal = function () {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        backtesterBtn.setAttribute('aria-pressed', 'false');
        backtesterBtn.focus();
    };

    closeBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            closeModal();
        }
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
    window.addEventListener('click', function (event) {
        if (event.target == modal) {
            closeModal();
        }
    });

    updateDisplay();
}

initBacktesterModal();

// ── Hindsight ────────────────────────────────────────────────────
const hindsightData = {
    "Extreme Fear": {
        "day7": { avgReturn: 1.11, winRate: 52.2, wins: 147, total: 275, best: 40.35, worst: -23.94 },
        "day14": { avgReturn: 1.44, winRate: 53.1, wins: 146, total: 275, best: 58.40, worst: -28.42 },
        "day30": { avgReturn: -0.85, winRate: 48.4, wins: 133, total: 275, best: 56.94, worst: -37.41 }
    },
    "Fear": {
        "day7": { avgReturn: 2.32, winRate: 57.0, wins: 251, total: 440, best: 32.74, worst: -16.67 },
        "day14": { avgReturn: 3.33, winRate: 56.8, wins: 250, total: 440, best: 50.68, worst: -22.65 },
        "day30": { avgReturn: 4.54, winRate: 56.8, wins: 250, total: 440, best: 74.11, worst: -30.99 }
    },
    "Neutral": {
        "day7": { avgReturn: 1.86, winRate: 53.1, wins: 230, total: 433, best: 27.03, worst: -15.05 },
        "day14": { avgReturn: 3.71, winRate: 56.4, wins: 244, total: 433, best: 42.62, worst: -22.50 },
        "day30": { avgReturn: 6.82, winRate: 59.6, wins: 258, total: 433, best: 79.08, worst: -26.30 }
    },
    "Greed": {
        "day7": { avgReturn: 0.67, winRate: 50.5, wins: 339, total: 671, best: 21.58, worst: -18.26 },
        "day14": { avgReturn: 2.04, winRate: 52.2, wins: 350, total: 671, best: 34.61, worst: -22.60 },
        "day30": { avgReturn: 3.97, winRate: 50.8, wins: 341, total: 671, best: 68.67, worst: -32.21 }
    },
    "Extreme Greed": {
        "day7": { avgReturn: 5.08, winRate: 63.6, wins: 96, total: 151, best: 32.74, worst: -17.12 },
        "day14": { avgReturn: 10.42, winRate: 69.5, wins: 105, total: 151, best: 57.89, worst: -20.28 },
        "day30": { avgReturn: 21.87, winRate: 74.8, wins: 113, total: 151, best: 120.47, worst: -28.90 }
    }
};

function getFGIRange(score) {
    return getZone(score).name;
}

function getReturnColor(value) {
    if (value > 5) return COLORS.up;
    if (value > 0) return '#d29922';
    if (value > -5) return '#db6d28';
    return COLORS.down;
}

function updateHindsightModal(score) {
    const range = getFGIRange(score);
    const data = hindsightData[range];

    document.getElementById('currentRangeBadge').textContent = `Current Range: ${range} (${score})`;

    const day7 = data.day7;
    const day14 = data.day14;
    const day30 = data.day30;

    document.getElementById('return7d').textContent = (day7.avgReturn > 0 ? '+' : '') + day7.avgReturn.toFixed(2) + '%';
    document.getElementById('return7d').style.color = getReturnColor(day7.avgReturn);
    document.getElementById('winrate7d').textContent = `Win Rate: ${day7.winRate.toFixed(1)}% (${day7.wins}/${day7.total})`;

    document.getElementById('return14d').textContent = (day14.avgReturn > 0 ? '+' : '') + day14.avgReturn.toFixed(2) + '%';
    document.getElementById('return14d').style.color = getReturnColor(day14.avgReturn);
    document.getElementById('winrate14d').textContent = `Win Rate: ${day14.winRate.toFixed(1)}% (${day14.wins}/${day14.total})`;

    document.getElementById('return30d').textContent = (day30.avgReturn > 0 ? '+' : '') + day30.avgReturn.toFixed(2) + '%';
    document.getElementById('return30d').style.color = getReturnColor(day30.avgReturn);
    document.getElementById('winrate30d').textContent = `Win Rate: ${day30.winRate.toFixed(1)}% (${day30.wins}/${day30.total})`;

    document.getElementById('bestCase').textContent = '+' + day30.best.toFixed(2) + '%';
    document.getElementById('bestCase').style.color = COLORS.up;
    document.getElementById('worstCase').textContent = day30.worst.toFixed(2) + '%';
    document.getElementById('worstCase').style.color = COLORS.down;
    document.getElementById('sampleSize').textContent = day30.total + ' occurrences';

    updateHindsightInsight(range, day30);
    updateComparisonTable(range);
}

function updateHindsightInsight(range, data) {
    let insight = '';

    if (range === 'Extreme Fear') {
        insight = `Historically, Extreme Fear has shown mixed results with a slight negative bias (-0.85% avg over 30 days). While contrarian wisdom suggests buying during fear, the data shows this range often precedes further declines. Best case: +${data.best.toFixed(0)}%, worst case: ${data.worst.toFixed(0)}%.`;
    } else if (range === 'Fear') {
        insight = `Fear levels have historically been solid entry points, averaging +4.54% over 30 days with a 56.8% win rate. This range offers good risk/reward with less downside than Extreme Fear. Consider gradual accumulation.`;
    } else if (range === 'Neutral') {
        insight = `Neutral sentiment has performed surprisingly well, averaging +6.82% over 30 days (59.6% win rate). This contradicts the "buy fear" narrative: stable sentiment often leads to steady gains. Second-best performer overall.`;
    } else if (range === 'Greed') {
        insight = `Greed has shown moderate returns (+3.97% avg, 50.8% win rate). While not as strong as Neutral or Extreme Greed, it is still positive. Momentum strategies have historically outperformed contrarian approaches in this range.`;
    } else if (range === 'Extreme Greed') {
        insight = `Extreme Greed is the top-performing range historically, with +21.87% average 30-day returns and a 74.8% win rate. This defies conventional wisdom: elevated sentiment has tended to precede further gains. Best case: +${data.best.toFixed(0)}%.`;
    }

    document.getElementById('insightText').textContent = insight;
}

function updateComparisonTable(currentRange) {
    const tbody = document.getElementById('comparisonTableBody');
    tbody.innerHTML = '';

    ZONES.map(z => z.name).forEach(range => {
        const data = hindsightData[range];
        const row = document.createElement('tr');
        if (range === currentRange) {
            row.classList.add('current-row');
        }

        row.innerHTML = `
            <td>${range}</td>
            <td style="color: ${getReturnColor(data.day7.avgReturn)}">${(data.day7.avgReturn > 0 ? '+' : '') + data.day7.avgReturn.toFixed(2)}%</td>
            <td style="color: ${getReturnColor(data.day14.avgReturn)}">${(data.day14.avgReturn > 0 ? '+' : '') + data.day14.avgReturn.toFixed(2)}%</td>
            <td style="color: ${getReturnColor(data.day30.avgReturn)}">${(data.day30.avgReturn > 0 ? '+' : '') + data.day30.avgReturn.toFixed(2)}%</td>
            <td>${data.day30.winRate.toFixed(1)}%</td>
            <td>${data.day30.total}</td>
        `;
        tbody.appendChild(row);
    });
}

function initHindsightModal() {
    const modal = document.getElementById('hindsightModal');
    const hindsightBtn = document.getElementById('hindsightToggle');
    const closeBtn = document.querySelector('.hindsight-close');
    const comparisonToggle = document.getElementById('comparisonToggle');
    const comparisonTable = document.getElementById('comparisonTableContainer');

    if (!modal || !hindsightBtn || !closeBtn) {
        console.error('Hindsight modal elements not found');
        return;
    }

    hindsightBtn.addEventListener('click', function () {
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        hindsightBtn.setAttribute('aria-pressed', 'true');
        updateHindsightModal(currentScore !== null ? currentScore : 50);
    });

    const closeModal = function () {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        hindsightBtn.setAttribute('aria-pressed', 'false');
        hindsightBtn.focus();
    };

    closeBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            closeModal();
        }
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
    comparisonToggle.addEventListener('click', function () {
        comparisonTable.classList.toggle('visible');
        comparisonToggle.textContent = comparisonTable.classList.contains('visible')
            ? 'Hide Comparison Table'
            : 'Compare All FGI Ranges';
    });
    window.addEventListener('click', function (event) {
        if (event.target == modal) {
            closeModal();
        }
    });
}

initHindsightModal();

// ── Header buttons ───────────────────────────────────────────────
document.getElementById('shareBtn').addEventListener('click', shareToX);
document.getElementById('refreshBtn').addEventListener('click', refreshAll);

// ── Historical scenario tool ─────────────────────────────────────
(function () {
    const BACKTEST_URL = '/data/backtest-results-5.5years.json';
    const LOW_SAMPLE_THRESHOLD = 10;
    let backtestData = null;

    let vgRange = 'Extreme Greed';
    let vgAmount = 1000;
    let vgPeriod = 30;

    const amountSlider = document.getElementById('vgAmountSlider');
    const amountDisplay = document.getElementById('vgAmountDisplay');
    const callout = document.getElementById('vgCallout');
    const lowSample = document.getElementById('vgLowSample');
    const resultCard = document.getElementById('vgResultCard');
    const resultLabel = document.getElementById('vgResultLabel');
    const resultMain = document.getElementById('vgResultMain');
    const returnVal = document.getElementById('vgReturnVal');
    const winRateVal = document.getElementById('vgWinRateVal');
    const sampleVal = document.getElementById('vgSampleVal');
    const periodVal = document.getElementById('vgPeriodVal');
    const sampleNote = document.getElementById('vgSampleNote');
    const shareBtn = document.getElementById('vgShareBtn');
    const toast = document.getElementById('vgToast');
    const backtesterLink = document.getElementById('vgBacktesterLink');

    fetch(BACKTEST_URL)
        .then(function (r) { return r.json(); })
        .then(function (data) {
            backtestData = data.results;
            updateResult();
        })
        .catch(function () {
            resultCard.innerHTML = '<div class="vg-error">Data unavailable. Try refreshing the page.</div>';
            shareBtn.disabled = true;
            shareBtn.style.opacity = '0.4';
        });

    function computeStats(range, period) {
        if (!backtestData) return null;
        var key = 'day' + period;
        var bucket = backtestData[range] && backtestData[range][key];
        if (!bucket || !bucket.returns || bucket.returns.length === 0) return null;
        var rets = bucket.returns;
        var n = rets.length;
        var avg = rets.reduce(function (s, v) { return s + v; }, 0) / n;
        var wins = rets.filter(function (v) { return v > 0; }).length;
        var winRate = (wins / n) * 100;
        return { n: n, avg: avg, winRate: winRate };
    }

    function formatDollar(val) {
        return '$' + Math.round(val).toLocaleString();
    }

    function updateResult() {
        if (!backtestData) return;
        var stats = computeStats(vgRange, vgPeriod);
        if (!stats) {
            resultLabel.textContent = 'No data for this combination.';
            resultMain.textContent = '--';
            return;
        }

        var result = vgAmount * (1 + stats.avg / 100);
        var positive = stats.avg >= 0;
        var returnStr = (positive ? '+' : '') + stats.avg.toFixed(1) + '%';
        var winRateStr = Math.round(stats.winRate) + '%';
        var resultStr = formatDollar(vgAmount) + ' → ' + formatDollar(result);

        resultLabel.textContent = 'If you bought every time FGI hit ' + vgRange + ' and held ' + vgPeriod + ' days...';
        resultMain.textContent = resultStr;
        resultMain.className = 'vg-result-main ' + (positive ? 'positive' : 'negative');

        returnVal.textContent = returnStr;
        winRateVal.textContent = winRateStr;
        sampleVal.textContent = stats.n;
        periodVal.textContent = vgPeriod + ' days';
        sampleNote.textContent = 'Based on ' + stats.n + ' occurrences · May 2020–Nov 2025';

        resultCard.className = 'vg-result-card ' + (positive ? 'positive' : 'negative');
        callout.className = 'vg-callout' + (vgRange === 'Extreme Greed' ? '' : ' hidden');

        if (stats.n < LOW_SAMPLE_THRESHOLD) {
            lowSample.textContent = 'Low sample size (n=' + stats.n + '). Treat with caution.';
            lowSample.className = 'vg-low-sample';
        } else {
            lowSample.className = 'vg-low-sample hidden';
        }
    }

    document.querySelectorAll('.vg-range-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.vg-range-btn').forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            vgRange = btn.dataset.range;
            updateResult();
        });
    });

    document.querySelectorAll('.vg-period-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.vg-period-btn').forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            vgPeriod = parseInt(btn.dataset.period);
            updateResult();
        });
    });

    amountSlider.addEventListener('input', function () {
        vgAmount = parseInt(amountSlider.value);
        amountDisplay.textContent = vgAmount.toLocaleString();
        updateResult();
    });

    if (backtesterLink) {
        backtesterLink.addEventListener('click', function () {
            var btn = document.getElementById('backtesterToggle');
            if (btn) btn.click();
        });
    }

    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(function () { toast.classList.remove('show'); }, 3000);
    }

    function buildCanvasCard(stats, callback) {
        var W = 600, H = 340;
        var canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        var ctx = canvas.getContext('2d');
        var positive = stats.avg >= 0;
        var accentColor = positive ? '#3fb950' : '#f85149';
        var result = vgAmount * (1 + stats.avg / 100);

        function draw() {
            // Background
            ctx.fillStyle = '#0d1117';
            ctx.fillRect(0, 0, W, H);

            // Border
            ctx.strokeStyle = '#30363d';
            ctx.lineWidth = 2;
            ctx.strokeRect(2, 2, W - 4, H - 4);

            // Header
            ctx.fillStyle = '#f7931a';
            ctx.font = "500 18px 'JetBrains Mono', Menlo, monospace";
            ctx.textAlign = 'center';
            ctx.fillText('FGI CHAD', W / 2, 38);

            // Separator
            ctx.strokeStyle = '#21262d';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(60, 52);
            ctx.lineTo(W - 60, 52);
            ctx.stroke();

            // Label
            ctx.fillStyle = '#8b949e';
            ctx.font = "14px 'Inter', system-ui, sans-serif";
            ctx.fillText('If you bought every time FGI hit ' + vgRange + ' and held ' + vgPeriod + ' days...', W / 2, 78);

            // Main result
            ctx.fillStyle = accentColor;
            ctx.font = "500 42px 'JetBrains Mono', Menlo, monospace";
            ctx.fillText(formatDollar(vgAmount) + ' → ' + formatDollar(result), W / 2, 140);

            // Stats row
            var cols = [W * 0.2, W * 0.5, W * 0.8];
            var labels = ['Avg Return', 'Win Rate', 'Occurrences'];
            var values = [
                (stats.avg >= 0 ? '+' : '') + stats.avg.toFixed(1) + '%',
                Math.round(stats.winRate) + '%',
                stats.n.toString()
            ];
            cols.forEach(function (x, i) {
                ctx.fillStyle = '#e6edf3';
                ctx.font = "500 20px 'JetBrains Mono', Menlo, monospace";
                ctx.textAlign = 'center';
                ctx.fillText(values[i], x, 190);
                ctx.fillStyle = '#8b949e';
                ctx.font = "12px 'Inter', system-ui, sans-serif";
                ctx.fillText(labels[i], x, 210);
            });
            ctx.textAlign = 'center';

            // Separator
            ctx.strokeStyle = '#21262d';
            ctx.beginPath();
            ctx.moveTo(60, 228);
            ctx.lineTo(W - 60, 228);
            ctx.stroke();

            // Sample note
            ctx.fillStyle = '#484f58';
            ctx.font = "12px 'Inter', system-ui, sans-serif";
            ctx.fillText('Based on ' + stats.n + ' occurrences · 5.5 years of data · fgichad.xyz', W / 2, 252);

            // Disclaimer
            ctx.fillStyle = '#484f58';
            ctx.font = "11px 'Inter', system-ui, sans-serif";
            ctx.fillText('Past performance does not guarantee future results. Not financial advice.', W / 2, 275);

            // Extreme Greed callout
            if (vgRange === 'Extreme Greed') {
                ctx.fillStyle = 'rgba(247, 147, 26, 0.08)';
                ctx.fillRect(60, 290, W - 120, 30);
                ctx.strokeStyle = 'rgba(247, 147, 26, 0.35)';
                ctx.strokeRect(60, 290, W - 120, 30);
                ctx.fillStyle = '#f7931a';
                ctx.font = "12px 'Inter', system-ui, sans-serif";
                ctx.fillText('Extreme Greed has outperformed Extreme Fear by 22.7%', W / 2, 310);
            }

            canvas.toBlob(function (blob) { callback(blob, canvas); }, 'image/png');
        }

        // Wait for webfonts so the PNG renders with the right typefaces
        Promise.all([
            document.fonts.load("500 42px 'JetBrains Mono'"),
            document.fonts.load("14px 'Inter'")
        ]).then(draw).catch(draw);
    }

    shareBtn.addEventListener('click', function () {
        if (!backtestData) return;
        var stats = computeStats(vgRange, vgPeriod);
        if (!stats) return;

        shareBtn.disabled = true;
        shareBtn.textContent = 'Generating...';

        buildCanvasCard(stats, function (blob, canvas) {
            shareBtn.disabled = false;
            shareBtn.textContent = 'Share This Result';

            var result = vgAmount * (1 + stats.avg / 100);
            var shareText = 'If you bought every time the Crypto Fear & Greed Index hit ' + vgRange +
                ' and held ' + vgPeriod + ' days...\n' +
                formatDollar(vgAmount) + ' → ' + formatDollar(result) +
                ' (' + (stats.avg >= 0 ? '+' : '') + stats.avg.toFixed(1) + '% avg, ' +
                Math.round(stats.winRate) + '% win rate)\n\n' +
                '5.5 years of data · fgichad.xyz';

            var file = new File([blob], 'fgichad-result.png', { type: 'image/png' });

            // Tier 1: native file share (iOS Safari, Chrome Android)
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator.share({ files: [file], title: 'FGI CHAD Result', text: shareText })
                    .catch(function () { /* user cancelled */ });
                return;
            }

            // Tier 2: native share without file (broader mobile)
            if (navigator.share) {
                navigator.share({ title: 'FGI CHAD Result', text: shareText, url: 'https://fgichad.xyz' })
                    .catch(function () { /* user cancelled */ });
                return;
            }

            // Tier 3: clipboard image (desktop Chrome/Edge)
            if (navigator.clipboard && window.ClipboardItem) {
                navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
                    .then(function () { showToast('Image copied to clipboard'); })
                    .catch(function () { downloadPng(blob); });
                return;
            }

            // Tier 4: download
            downloadPng(blob);
        });
    });

    function downloadPng(blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'fgichad-result.png';
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        showToast('Image downloaded');
    }
})();

// ── Mobile footer nav ────────────────────────────────────────────
let lastScrollTop = 0;
const mobileFooter = document.getElementById('controlsMobile');

if (mobileFooter) {
    const mobileHindsightBtn = mobileFooter.querySelector('.hindsight-btn');
    const mobileButtons = mobileFooter.querySelectorAll('button.control-btn');
    const mobileBacktesterBtn = mobileButtons[0];
    const mobilePortfolioBtn = mobileButtons[1];

    if (mobileHindsightBtn) {
        mobileHindsightBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const modal = document.getElementById('hindsightModal');
            const desktopBtn = document.getElementById('hindsightToggle');
            if (modal && desktopBtn) {
                modal.style.display = 'block';
                modal.setAttribute('aria-hidden', 'false');
                desktopBtn.setAttribute('aria-pressed', 'true');
                updateHindsightModal(currentScore !== null ? currentScore : 50);
            }
        });
    }

    if (mobileBacktesterBtn) {
        mobileBacktesterBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const modal = document.getElementById('backtesterModal');
            const desktopBtn = document.getElementById('backtesterToggle');
            if (modal && desktopBtn) {
                modal.style.display = 'block';
                modal.setAttribute('aria-hidden', 'false');
                desktopBtn.setAttribute('aria-pressed', 'true');
            }
        });
    }

    if (mobilePortfolioBtn) {
        mobilePortfolioBtn.addEventListener('click', function (e) {
            e.preventDefault();
            // Reuse the desktop button's full open handler (migration notice,
            // holdings table render, live price refresh) instead of duplicating it.
            const desktopBtn = document.getElementById('portfolioToggle');
            if (desktopBtn) desktopBtn.click();
        });
    }

    // Hide on scroll down, show on scroll up
    if (window.innerWidth <= 768) {
        window.addEventListener('scroll', function () {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                mobileFooter.classList.add('hidden-scroll');
            } else if (scrollTop < lastScrollTop) {
                mobileFooter.classList.remove('hidden-scroll');
            }
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        }, false);
    }
}
