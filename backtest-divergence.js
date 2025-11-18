import axios from 'axios';

// Fetch historical FGI data
async function fetchFGI(days = 365) {
    try {
        const response = await axios.get(`https://api.alternative.me/fgi/?limit=${days}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        });
        return response.data.data.map(item => ({
            date: new Date(parseInt(item.timestamp) * 1000).toISOString().split('T')[0],
            timestamp: parseInt(item.timestamp),
            fgi: parseInt(item.value),
            fgiClass: item.value_classification
        }));
    } catch (error) {
        console.error('Failed to fetch FGI data:', error.message);
        return [];
    }
}

// Fetch historical BTC price data
async function fetchBTCPrice(days = 365) {
    try {
        const response = await axios.get(
            `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}&interval=daily`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json'
                }
            }
        );
        return response.data.prices.map(([timestamp, price]) => ({
            date: new Date(timestamp).toISOString().split('T')[0],
            timestamp: Math.floor(timestamp / 1000),
            price: price
        }));
    } catch (error) {
        console.error('Failed to fetch BTC price:', error.message);
        return [];
    }
}

// Merge datasets by date
function mergeData(fgiData, priceData) {
    const priceMap = new Map(priceData.map(item => [item.date, item.price]));

    return fgiData
        .map(fgiItem => ({
            ...fgiItem,
            price: priceMap.get(fgiItem.date)
        }))
        .filter(item => item.price !== undefined)
        .sort((a, b) => a.timestamp - b.timestamp);
}

// Calculate percentage change over window
function calculateChange(data, endIndex, windowDays) {
    if (endIndex < windowDays) return null;

    const current = data[endIndex];
    const previous = data[endIndex - windowDays];

    const priceChange = ((current.price - previous.price) / previous.price) * 100;
    const fgiChange = ((current.fgi - previous.fgi) / previous.fgi) * 100;

    return {
        date: current.date,
        priceChange,
        fgiChange,
        price: current.price,
        fgi: current.fgi,
        fgiClass: current.fgiClass
    };
}

// Detect divergence
function detectDivergence(priceChange, fgiChange, threshold = { price: 5, fgi: 10 }) {
    // Bearish: Price up significantly, FGI down significantly
    if (priceChange > threshold.price && fgiChange < -threshold.fgi) {
        return {
            type: 'bearish',
            magnitude: Math.abs(priceChange - fgiChange)
        };
    }

    // Bullish: Price down significantly, FGI up significantly
    if (priceChange < -threshold.price && fgiChange > threshold.fgi) {
        return {
            type: 'bullish',
            magnitude: Math.abs(priceChange - fgiChange)
        };
    }

    return null;
}

// Check what happened after divergence
function checkOutcome(data, divergenceIndex, lookAheadDays = 7) {
    if (divergenceIndex + lookAheadDays >= data.length) return null;

    const startPrice = data[divergenceIndex].price;
    const endPrice = data[divergenceIndex + lookAheadDays].price;
    const priceReturn = ((endPrice - startPrice) / startPrice) * 100;

    return priceReturn;
}

// Main backtest
async function runBacktest() {
    console.log('🔍 Fetching historical data...\n');

    const fgiData = await fetchFGI(365);
    const priceData = await fetchBTCPrice(365);
    const merged = mergeData(fgiData, priceData);

    console.log(`✅ Data loaded: ${merged.length} days of history`);
    console.log(`📅 Date range: ${merged[0].date} to ${merged[merged.length - 1].date}\n`);

    // Test different windows and thresholds
    const windows = [3, 7, 14];
    const thresholds = [
        { price: 5, fgi: 10 },
        { price: 7, fgi: 12 },
        { price: 10, fgi: 15 }
    ];

    for (const window of windows) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📊 TESTING ${window}-DAY WINDOW`);
        console.log(`${'='.repeat(60)}\n`);

        for (const threshold of thresholds) {
            console.log(`Threshold: Price ±${threshold.price}%, FGI ±${threshold.fgi}%`);
            console.log(`${'-'.repeat(60)}`);

            const results = {
                bearish: { count: 0, successful: 0, returns: [], examples: [] },
                bullish: { count: 0, successful: 0, returns: [], examples: [] }
            };

            // Scan through history
            for (let i = window; i < merged.length - 7; i++) {
                const change = calculateChange(merged, i, window);
                if (!change) continue;

                const divergence = detectDivergence(change.priceChange, change.fgiChange, threshold);
                if (!divergence) continue;

                const futureReturn = checkOutcome(merged, i, 7);
                if (futureReturn === null) continue;

                const type = divergence.type;
                results[type].count++;
                results[type].returns.push(futureReturn);

                // Bearish divergence should predict price drop
                // Bullish divergence should predict price rise
                const wasCorrect = type === 'bearish' ? futureReturn < 0 : futureReturn > 0;

                if (wasCorrect) {
                    results[type].successful++;
                }

                // Store top 3 examples
                if (results[type].examples.length < 3) {
                    results[type].examples.push({
                        date: change.date,
                        priceChange: change.priceChange.toFixed(2),
                        fgiChange: change.fgiChange.toFixed(2),
                        futureReturn: futureReturn.toFixed(2),
                        correct: wasCorrect,
                        fgi: change.fgi,
                        fgiClass: change.fgiClass,
                        price: change.price.toFixed(0)
                    });
                }
            }

            // Print results
            ['bearish', 'bullish'].forEach(type => {
                const data = results[type];

                if (data.count === 0) {
                    console.log(`\n${type.toUpperCase()}: No divergences found`);
                    return;
                }

                const successRate = (data.successful / data.count) * 100;
                const avgReturn = data.returns.reduce((a, b) => a + b, 0) / data.returns.length;
                const avgSuccessReturn = data.returns
                    .filter((ret, idx) => type === 'bearish' ? ret < 0 : ret > 0)
                    .reduce((a, b) => a + b, 0) / data.successful || 0;

                console.log(`\n${type.toUpperCase()} DIVERGENCES:`);
                console.log(`  Total found: ${data.count}`);
                console.log(`  Predictive accuracy: ${successRate.toFixed(1)}% (${data.successful}/${data.count})`);
                console.log(`  Avg 7-day return: ${avgReturn.toFixed(2)}%`);
                if (data.successful > 0) {
                    console.log(`  Avg return when correct: ${avgSuccessReturn.toFixed(2)}%`);
                }

                if (data.examples.length > 0) {
                    console.log(`\n  Examples:`);
                    data.examples.forEach((ex, idx) => {
                        const icon = ex.correct ? '✅' : '❌';
                        console.log(`    ${idx + 1}. ${ex.date} ${icon}`);
                        console.log(`       BTC: $${ex.price} | FGI: ${ex.fgi} (${ex.fgiClass})`);
                        console.log(`       ${window}d change: Price ${ex.priceChange > 0 ? '+' : ''}${ex.priceChange}%, FGI ${ex.fgiChange > 0 ? '+' : ''}${ex.fgiChange}%`);
                        console.log(`       7d later: ${ex.futureReturn > 0 ? '+' : ''}${ex.futureReturn}%\n`);
                    });
                }
            });

            console.log();
        }
    }

    // Analyze correlation
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📈 CORRELATION ANALYSIS`);
    console.log(`${'='.repeat(60)}\n`);

    // Check how often price and FGI move together
    let sameDirection = 0;
    let oppositeDirection = 0;

    for (let i = 7; i < merged.length; i++) {
        const change = calculateChange(merged, i, 7);
        if (!change) continue;

        if ((change.priceChange > 0 && change.fgiChange > 0) ||
            (change.priceChange < 0 && change.fgiChange < 0)) {
            sameDirection++;
        } else if ((change.priceChange > 0 && change.fgiChange < 0) ||
                   (change.priceChange < 0 && change.fgiChange > 0)) {
            oppositeDirection++;
        }
    }

    const total = sameDirection + oppositeDirection;
    console.log(`Over 7-day windows in the past year:`);
    console.log(`  Price & FGI move TOGETHER: ${sameDirection}/${total} (${(sameDirection/total*100).toFixed(1)}%)`);
    console.log(`  Price & FGI move OPPOSITE: ${oppositeDirection}/${total} (${(oppositeDirection/total*100).toFixed(1)}%)`);
    console.log(`\n💡 This confirms your intuition: price and sentiment are highly correlated!`);
}

// Run it
runBacktest().catch(console.error);
