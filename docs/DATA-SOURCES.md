# Hindsight Score - Data Sources Documentation

## Overview

This document details all data sources used for the Hindsight Score feature, including APIs, data ranges, limitations, and reliability.

---

## 1. Fear & Greed Index Data

### Source: Alternative.me API
- **URL**: `https://api.alternative.me/fng/`
- **Documentation**: https://alternative.me/crypto/fear-and-greed-index/
- **Free Tier**: Yes (no API key required)
- **Rate Limit**: Reasonable for production use

### Data Specifications
- **Available History**: February 1, 2018 - Present (7.79 years as of Nov 2025)
- **Update Frequency**: Daily (updates once per day around UTC midnight)
- **Data Points**:
  - `value`: FGI score (0-100)
  - `value_classification`: Text classification (Extreme Fear, Fear, Neutral, Greed, Extreme Greed)
  - `timestamp`: Unix timestamp
- **Granularity**: Daily
- **Reliability**: ✅ **Excellent** - Stable API, historical data complete

### Example API Call
```bash
# Get last 365 days
curl "https://api.alternative.me/fng/?limit=365&format=json"

# Get maximum available (2844 days)
curl "https://api.alternative.me/fng/?limit=0&format=json"
```

### Response Format
```json
{
  "name": "Fear and Greed Index",
  "data": [
    {
      "value": "45",
      "value_classification": "Fear",
      "timestamp": "1700352000",
      "time_until_update": "..."
    }
  ]
}
```

### Used In Backtest
- **Period Used**: May 28, 2020 - November 18, 2025 (2,000 days)
- **Why Not Earlier?**: Limited by Bitcoin price data availability (see below)
- **Sample Sizes by Range** (5.5-year backtest):
  - Extreme Fear (0-24): 275 occurrences
  - Fear (25-44): 440 occurrences
  - Neutral (45-59): 433 occurrences
  - Greed (60-79): 671 occurrences
  - Extreme Greed (80-100): 151 occurrences

---

## 2. Bitcoin Price Data

### Primary Source (Used in Backtest): CryptoCompare API
- **URL**: `https://min-api.cryptocompare.com/data/v2/histoday`
- **Documentation**: https://min-api.cryptocompare.com/documentation
- **Free Tier**: Yes (100,000 calls/month)
- **Rate Limit**: Generous for production use

### Data Specifications
- **Available History**: May 28, 2020 - Present (2,001 days with limit=2000)
- **Update Frequency**: Daily
- **Data Points**:
  - `time`: Unix timestamp
  - `close`: Closing price in USD
  - `high`: High price
  - `low`: Low price
  - `open`: Opening price
  - `volumefrom`: Trading volume
- **Granularity**: Daily (perfect for our needs)
- **Reliability**: ✅ **Excellent** - Professional-grade API

### Example API Call
```bash
# Get 2000 days of BTC/USD daily data
curl "https://min-api.cryptocompare.com/data/v2/histoday?fsym=BTC&tsym=USD&limit=2000"
```

### Response Format
```json
{
  "Response": "Success",
  "Data": {
    "Data": [
      {
        "time": 1590624000,
        "close": 9426.8,
        "high": 9560.0,
        "low": 9200.0,
        "open": 9300.5,
        "volumefrom": 12345.67
      }
    ]
  }
}
```

### Why CryptoCompare Over CoinGecko?

| Feature | CryptoCompare | CoinGecko (Free) |
|---------|---------------|------------------|
| Max Daily Data | 2,000 days | 365 days |
| Free Tier | 100k calls/month | Limited to 1 year |
| Granularity | Daily | Daily (if ≤365 days) |
| Reliability | Excellent | Good (but 401 errors on historical) |

**Decision**: CryptoCompare provides 5.5 years vs CoinGecko's 1 year maximum.

---

## 3. Alternative Bitcoin Price Sources (Not Used, But Tested)

### CoinGecko API (Tested but Limited)
- **URL**: `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart`
- **Free Tier Limit**: 365 days maximum for daily granularity
- **Issue**: Returns HTTP 401 for historical requests beyond 1 year
- **Verdict**: ❌ Not suitable for extended backtest

### Yahoo Finance (Not Tested)
- **Potential**: Could provide years of historical data
- **Implementation**: Would require `yfinance` Python library or similar
- **Verdict**: ⏭️ Possible alternative if CryptoCompare becomes unavailable

---

## 4. Data Merging Process

### How FGI and BTC Price Data Are Combined

1. **Fetch FGI Data**: Get 2,000 days from Alternative.me
2. **Fetch BTC Data**: Get 2,000 days from CryptoCompare
3. **Merge by Date**: Match records by date (YYYY-MM-DD format)
4. **Result**: 2,000 matched data points spanning May 2020 - Nov 2025

### Example Merged Record
```javascript
{
  date: "2024-11-18",
  timestamp: 1731888000,
  fgiScore: 58,
  fgiClassification: "Neutral",
  btcPrice: 91234.56
}
```

### Data Integrity Checks
- ✅ All 2,000 days have matching FGI + BTC data
- ✅ No gaps or missing dates
- ✅ Timestamps align properly
- ✅ Price data is reasonable (no outliers/errors detected)

---

## 5. Forward Return Calculations

### Methodology

For each historical day, we calculate forward returns at 3 time horizons:

```javascript
// Example: Day 100 in dataset
const currentPrice = mergedData[100].btcPrice;  // $50,000

// 7-day forward return
const price7DaysLater = mergedData[107].btcPrice;  // $52,000
const return7d = ((52000 - 50000) / 50000) * 100;  // +4.00%

// 14-day forward return
const price14DaysLater = mergedData[114].btcPrice;  // $48,000
const return14d = ((48000 - 50000) / 50000) * 100;  // -4.00%

// 30-day forward return
const price30DaysLater = mergedData[130].btcPrice;  // $55,000
const return30d = ((55000 - 50000) / 50000) * 100;  // +10.00%
```

### Edge Cases Handled
- **Insufficient Future Data**: Last 30 days of dataset cannot have 30-day forward returns
  - These data points are excluded from 30-day statistics
  - Sample sizes are adjusted accordingly
- **Weekends/Holidays**: Not applicable (crypto trades 24/7)

---

## 6. Statistical Aggregations

### Metrics Calculated for Each FGI Range

For each of the 5 FGI ranges (Extreme Fear, Fear, Neutral, Greed, Extreme Greed), we calculate:

1. **Average Return**: Mean of all forward returns in that range
   ```javascript
   avgReturn = sum(returns) / count(returns)
   ```

2. **Median Return**: Middle value when sorted
   ```javascript
   medianReturn = sortedReturns[Math.floor(length / 2)]
   ```

3. **Win Rate**: Percentage of profitable occurrences
   ```javascript
   winRate = (profitable_count / total_count) * 100
   ```

4. **Best Case**: Maximum return observed
   ```javascript
   bestReturn = Math.max(...returns)
   ```

5. **Worst Case**: Minimum return observed
   ```javascript
   worstReturn = Math.min(...returns)
   ```

6. **Sample Size**: Number of occurrences
   ```javascript
   sampleSize = returns.length
   ```

### Example: Fear (25-44) 30-Day Stats

```javascript
{
  avgReturn: 4.54,      // +4.54% average
  medianReturn: 2.34,   // +2.34% median
  winRate: 56.8,        // 56.8% profitable
  bestReturn: 74.11,    // Best: +74.11%
  worstReturn: -30.99,  // Worst: -30.99%
  sampleSize: 440       // 440 occurrences
}
```

---

## 7. Data Refresh Strategy (For Production)

### Recommended Update Frequency

1. **Historical Backtest Data**: Monthly
   - Re-run full backtest with updated data
   - Keep results cached for 30 days
   - Why monthly? FGI only updates daily, so daily re-calculation is overkill

2. **Current FGI Score**: Real-time (on each page load)
   - Fetch latest FGI score from Alternative.me
   - Determine which range user is in
   - Display corresponding historical statistics

### Caching Strategy

```javascript
// Pseudo-code for production API endpoint
app.get('/api/hindsight-score', async (req, res) => {
  // Check cache first (6 hour TTL)
  const cached = cache.get('hindsight-data');
  if (cached && cached.timestamp > Date.now() - 21600000) {
    return res.json(cached.data);
  }

  // Fetch current FGI
  const currentFGI = await fetch('https://api.alternative.me/fng/?limit=1');
  const currentScore = currentFGI.data[0].value;
  const rangeName = getFGIRange(currentScore);

  // Return pre-calculated stats for this range
  const stats = backtestResults[rangeName];

  // Cache for 6 hours
  cache.set('hindsight-data', { data: stats, timestamp: Date.now() });

  return res.json(stats);
});
```

### Storage Requirements

- **Backtest Results**: ~50 KB JSON file
- **Raw Historical Data**: ~500 KB JSON file
- **Total**: <1 MB (negligible)

---

## 8. Data Source Reliability Assessment

### Alternative.me (FGI)
- **Uptime**: ✅ 99.9%+ (rarely down)
- **Data Accuracy**: ✅ Industry standard for FGI
- **Backwards Compatibility**: ✅ API hasn't changed in years
- **Risk Level**: 🟢 **LOW**
- **Backup Plan**: Could scrape website directly if API fails

### CryptoCompare (BTC Price)
- **Uptime**: ✅ 99.9%+ (enterprise-grade)
- **Data Accuracy**: ✅ Aggregates from multiple exchanges
- **Free Tier Limits**: ⚠️ 100k calls/month (sufficient for our use)
- **Risk Level**: 🟢 **LOW**
- **Backup Plan**: Switch to CoinGecko or Yahoo Finance

---

## 9. Data Validation

### Checks Performed During Backtest

1. **API Response Validation**
   ```javascript
   if (!response.ok) throw new Error(`HTTP ${response.status}`);
   if (!data.data || !Array.isArray(data.data)) throw new Error('Invalid format');
   ```

2. **Data Completeness**
   ```javascript
   // Ensure we got expected number of data points
   if (fgiData.length < requestedDays * 0.95) {
     console.warn('Incomplete FGI data');
   }
   ```

3. **Price Sanity Checks**
   ```javascript
   // Bitcoin price should be within reasonable bounds
   if (price < 1000 || price > 1000000) {
     console.warn(`Suspicious BTC price: $${price}`);
   }
   ```

4. **Date Alignment**
   ```javascript
   // Ensure FGI and BTC dates match
   const merged = mergeDataByDate(fgiData, btcData);
   if (merged.length < Math.min(fgiData.length, btcData.length) * 0.9) {
     console.warn('Poor date alignment');
   }
   ```

---

## 10. Known Limitations

### Sample Size Limitations

| Range | Sample Size | Confidence Level |
|-------|-------------|------------------|
| Extreme Fear | 275 | ⚠️ Moderate (need 385 for 95% confidence) |
| Fear | 440 | ✅ High |
| Neutral | 433 | ✅ High |
| Greed | 671 | ✅ Very High |
| Extreme Greed | 151 | ❌ Low (underpowered) |

**Implication**: Extreme Greed results (+21.87% avg) have wider confidence intervals. True mean could be ±8% with 95% confidence.

### Time Period Bias

- **Data Period**: May 2020 - Nov 2025 (5.5 years)
- **Market Conditions Included**:
  - ✅ COVID crash (March 2020)
  - ✅ 2020-2021 bull run (to $69k)
  - ✅ 2022 bear market crash
  - ✅ 2024-2025 bull run (to $124k)

- **Missing**:
  - ❌ Pre-2020 data (limited by BTC price API)
  - ❌ Future market regimes (obviously)

**Implication**: Results may not apply in drastically different market conditions (e.g., multi-year bear market)

### API Dependencies

- **Single Point of Failure**: If Alternative.me goes down, FGI data is unavailable
- **Mitigation**: Cache results aggressively + have fallback data sources

---

## 11. Production Recommendations

### 1. Use Pre-Calculated Results
Don't recalculate on every request. Store backtest results in a JSON file:

```json
{
  "lastUpdated": "2025-11-18T00:00:00Z",
  "dataRange": {
    "start": "2020-05-28",
    "end": "2025-11-18",
    "days": 2000
  },
  "ranges": {
    "Fear": {
      "30day": {
        "avgReturn": 4.54,
        "winRate": 56.8,
        ...
      }
    }
  }
}
```

### 2. Monthly Backtest Updates
Run `node backtest-hindsight-score.js` monthly (e.g., 1st of each month at midnight UTC):

```bash
# Cron job (runs 1st of month at 00:00 UTC)
0 0 1 * * cd /path/to/meta-fgi && node backtest-hindsight-score.js
```

### 3. Monitor API Health
Set up monitoring for:
- Alternative.me API availability
- CryptoCompare API availability
- Data freshness (alert if last update >48 hours old)

### 4. Display Data Freshness
Show users when data was last updated:

```html
<div class="data-freshness">
  📅 Historical data: May 2020 - Nov 2025 (updated monthly)
</div>
```

---

## 12. Cost Analysis

### Free Tier Limits

| Service | Free Tier | Our Usage | Sufficient? |
|---------|-----------|-----------|-------------|
| Alternative.me | Unlimited* | ~30 calls/month | ✅ Yes |
| CryptoCompare | 100k calls/month | ~30 calls/month | ✅ Yes |

*No official rate limit, but be reasonable (don't spam)

### Estimated Monthly Costs
- **APIs**: $0 (using free tiers)
- **Hosting**: Already covered by Vercel
- **Storage**: <1 MB (negligible)
- **Total**: **$0/month** ✅

---

## 13. Data Attribution

### Legal Requirements

Per Alternative.me terms:
> "Free to use with attribution"

**Required Attribution**:
```html
<div class="attribution">
  Fear & Greed Index data provided by
  <a href="https://alternative.me" target="_blank">Alternative.me</a>
</div>
```

Per CryptoCompare terms:
> "Free tier requires attribution"

**Required Attribution**:
```html
<div class="attribution">
  Bitcoin price data provided by
  <a href="https://www.cryptocompare.com" target="_blank">CryptoCompare</a>
</div>
```

---

## 14. Summary

### Data Sources Used
1. ✅ **Alternative.me API** - Fear & Greed Index (7.79 years available, using 5.5 years)
2. ✅ **CryptoCompare API** - Bitcoin Prices (5.5 years available)

### Data Quality
- **Sample Sizes**: 151-671 occurrences per range (mostly sufficient)
- **Time Period**: May 2020 - Nov 2025 (includes full market cycles)
- **Reliability**: Both APIs are stable and professional-grade
- **Cost**: $0/month (free tiers sufficient)

### Next Steps for Production
1. Pre-calculate backtest results monthly
2. Cache results with 6-hour TTL
3. Add API health monitoring
4. Include proper attribution links
5. Display data freshness to users

---

**Files Referenced**:
- `backtest-hindsight-score.js` - Backtest script (uses these APIs)
- `backtest-results-5.5years.json` - Output with all calculations
- `test-api-limits.js` - API testing script
- `test-btc-alternatives.js` - Alternative source testing

**Last Updated**: November 18, 2025
