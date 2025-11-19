/**
 * HINDSIGHT SCORE BACKTESTING SCRIPT
 *
 * This script validates the Hindsight Score concept by:
 * 1. Fetching real historical Fear & Greed Index data (365 days)
 * 2. Fetching real historical Bitcoin price data (365 days)
 * 3. Calculating actual forward returns for each FGI range
 * 4. Computing statistics (avg return, win rate, best/worst, sample size)
 * 5. Generating actionable insights
 */

import fs from 'fs';

// Configuration
const CONFIG = {
  FGI_HISTORY_DAYS: 2000, // Get ~5.5 years of data (max overlap with BTC data)
  BTC_HISTORY_LIMIT: 2000, // CryptoCompare allows 2000 days
  FORWARD_PERIODS: [7, 14, 30], // Days to look ahead
  FGI_RANGES: {
    'Extreme Fear': { min: 0, max: 24 },
    'Fear': { min: 25, max: 44 },
    'Neutral': { min: 45, max: 59 },
    'Greed': { min: 60, max: 79 },
    'Extreme Greed': { min: 80, max: 100 }
  }
};

/**
 * Fetch historical Fear & Greed Index data
 */
async function fetchHistoricalFGI() {
  console.log(`📊 Fetching ${CONFIG.FGI_HISTORY_DAYS} days of FGI data...`);

  try {
    const response = await fetch(
      `https://api.alternative.me/fng/?limit=${CONFIG.FGI_HISTORY_DAYS}&format=json`
    );

    if (!response.ok) {
      throw new Error(`FGI API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid FGI data format');
    }

    // Convert to easier format: oldest first
    const fgiData = data.data.reverse().map(item => ({
      timestamp: parseInt(item.timestamp),
      date: new Date(parseInt(item.timestamp) * 1000).toISOString().split('T')[0],
      score: parseInt(item.value),
      classification: item.value_classification
    }));

    console.log(`✅ Fetched ${fgiData.length} days of FGI data`);
    console.log(`   Range: ${fgiData[0].date} to ${fgiData[fgiData.length - 1].date}`);

    return fgiData;
  } catch (error) {
    console.error('❌ Error fetching FGI data:', error.message);
    throw error;
  }
}

/**
 * Fetch historical Bitcoin price data from CryptoCompare (supports longer history)
 */
async function fetchHistoricalBTCPrices() {
  console.log(`\n💰 Fetching ${CONFIG.BTC_HISTORY_LIMIT} days of BTC price data...`);

  try {
    // CryptoCompare allows 2000 days of daily data (free tier)
    const response = await fetch(
      `https://min-api.cryptocompare.com/data/v2/histoday?fsym=BTC&tsym=USD&limit=${CONFIG.BTC_HISTORY_LIMIT}`
    );

    if (!response.ok) {
      throw new Error(`CryptoCompare API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.Data || !data.Data.Data || !Array.isArray(data.Data.Data)) {
      throw new Error('Invalid Bitcoin price data format');
    }

    // Convert to easier format
    const btcData = data.Data.Data.map(item => ({
      timestamp: item.time,
      date: new Date(item.time * 1000).toISOString().split('T')[0],
      price: item.close // Use closing price
    }));

    console.log(`✅ Fetched ${btcData.length} days of BTC price data`);
    console.log(`   Range: ${btcData[0].date} to ${btcData[btcData.length - 1].date}`);
    console.log(`   Price range: $${Math.min(...btcData.map(d => d.price)).toFixed(0)} - $${Math.max(...btcData.map(d => d.price)).toFixed(0)}`);

    return btcData;
  } catch (error) {
    console.error('❌ Error fetching BTC price data:', error.message);
    throw error;
  }
}

/**
 * Merge FGI and BTC data by date
 */
function mergeDataByDate(fgiData, btcData) {
  console.log(`\n🔗 Merging FGI and BTC data by date...`);

  // Create a map of BTC prices by date for faster lookup
  const btcPriceMap = new Map();
  btcData.forEach(item => {
    btcPriceMap.set(item.date, item.price);
  });

  // Merge datasets
  const merged = fgiData
    .map(fgiItem => {
      const btcPrice = btcPriceMap.get(fgiItem.date);
      if (!btcPrice) return null;

      return {
        date: fgiItem.date,
        timestamp: fgiItem.timestamp,
        fgiScore: fgiItem.score,
        fgiClassification: fgiItem.classification,
        btcPrice: btcPrice
      };
    })
    .filter(item => item !== null); // Remove days without matching BTC price

  console.log(`✅ Merged ${merged.length} days of data`);

  return merged;
}

/**
 * Calculate forward returns for each data point
 */
function calculateForwardReturns(mergedData) {
  console.log(`\n📈 Calculating forward returns...`);

  const dataWithReturns = mergedData.map((item, index) => {
    const returns = {};

    CONFIG.FORWARD_PERIODS.forEach(days => {
      const futureIndex = index + days;

      if (futureIndex < mergedData.length) {
        const futurePrice = mergedData[futureIndex].btcPrice;
        const currentPrice = item.btcPrice;
        const returnPct = ((futurePrice - currentPrice) / currentPrice) * 100;

        returns[`day${days}`] = {
          return: returnPct,
          futurePrice: futurePrice,
          futureDate: mergedData[futureIndex].date
        };
      } else {
        returns[`day${days}`] = null; // Not enough future data
      }
    });

    return {
      ...item,
      returns
    };
  });

  console.log(`✅ Calculated forward returns for ${CONFIG.FORWARD_PERIODS.join(', ')} days`);

  return dataWithReturns;
}

/**
 * Get FGI range name for a score
 */
function getFGIRange(score) {
  for (const [rangeName, range] of Object.entries(CONFIG.FGI_RANGES)) {
    if (score >= range.min && score <= range.max) {
      return rangeName;
    }
  }
  return 'Unknown';
}

/**
 * Analyze returns by FGI range
 */
function analyzeReturnsByRange(dataWithReturns) {
  console.log(`\n🔬 Analyzing returns by FGI range...`);

  const results = {};

  // Initialize results structure
  Object.keys(CONFIG.FGI_RANGES).forEach(rangeName => {
    results[rangeName] = {};
    CONFIG.FORWARD_PERIODS.forEach(days => {
      results[rangeName][`day${days}`] = {
        returns: [],
        avgReturn: 0,
        medianReturn: 0,
        winRate: 0,
        bestReturn: 0,
        worstReturn: 0,
        sampleSize: 0
      };
    });
  });

  // Group returns by FGI range
  dataWithReturns.forEach(item => {
    const rangeName = getFGIRange(item.fgiScore);

    CONFIG.FORWARD_PERIODS.forEach(days => {
      const returnData = item.returns[`day${days}`];

      if (returnData !== null) {
        results[rangeName][`day${days}`].returns.push(returnData.return);
      }
    });
  });

  // Calculate statistics for each range and period
  Object.keys(results).forEach(rangeName => {
    CONFIG.FORWARD_PERIODS.forEach(days => {
      const key = `day${days}`;
      const returns = results[rangeName][key].returns;

      if (returns.length > 0) {
        // Sort returns for median calculation
        const sortedReturns = [...returns].sort((a, b) => a - b);

        // Calculate statistics
        const avg = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const median = sortedReturns[Math.floor(sortedReturns.length / 2)];
        const wins = returns.filter(r => r > 0).length;
        const winRate = (wins / returns.length) * 100;
        const best = Math.max(...returns);
        const worst = Math.min(...returns);

        results[rangeName][key] = {
          returns: returns,
          avgReturn: avg,
          medianReturn: median,
          winRate: winRate,
          bestReturn: best,
          worstReturn: worst,
          sampleSize: returns.length
        };
      }
    });
  });

  console.log(`✅ Analysis complete`);

  return results;
}

/**
 * Print results in a readable format
 */
function printResults(results) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 HINDSIGHT SCORE BACKTEST RESULTS`);
  console.log(`${'='.repeat(80)}\n`);

  Object.entries(results).forEach(([rangeName, periods]) => {
    const range = CONFIG.FGI_RANGES[rangeName];
    console.log(`\n🎯 ${rangeName.toUpperCase()} (FGI ${range.min}-${range.max})`);
    console.log(`${'─'.repeat(80)}`);

    CONFIG.FORWARD_PERIODS.forEach(days => {
      const stats = periods[`day${days}`];

      if (stats.sampleSize === 0) {
        console.log(`\n  ${days}-Day Returns: NO DATA`);
        return;
      }

      console.log(`\n  ${days}-Day Forward Returns:`);
      console.log(`    • Average Return:   ${stats.avgReturn >= 0 ? '+' : ''}${stats.avgReturn.toFixed(2)}%`);
      console.log(`    • Median Return:    ${stats.medianReturn >= 0 ? '+' : ''}${stats.medianReturn.toFixed(2)}%`);
      console.log(`    • Win Rate:         ${stats.winRate.toFixed(1)}% (${stats.returns.filter(r => r > 0).length}/${stats.sampleSize} profitable)`);
      console.log(`    • Best Case:        +${stats.bestReturn.toFixed(2)}%`);
      console.log(`    • Worst Case:       ${stats.worstReturn.toFixed(2)}%`);
      console.log(`    • Sample Size:      ${stats.sampleSize} occurrences`);
    });

    console.log();
  });

  console.log(`${'='.repeat(80)}\n`);
}

/**
 * Generate insights from the backtest
 */
function generateInsights(results) {
  console.log(`💡 KEY INSIGHTS:\n`);

  const insights = [];

  // Compare 30-day returns across all ranges
  const thirtyDayReturns = {};
  Object.entries(results).forEach(([rangeName, periods]) => {
    if (periods.day30.sampleSize > 0) {
      thirtyDayReturns[rangeName] = periods.day30.avgReturn;
    }
  });

  // Find best and worst performing ranges
  const sortedRanges = Object.entries(thirtyDayReturns)
    .sort((a, b) => b[1] - a[1]);

  if (sortedRanges.length > 0) {
    const best = sortedRanges[0];
    const worst = sortedRanges[sortedRanges.length - 1];

    insights.push(`1. Best 30-day performance: ${best[0]} averaged +${best[1].toFixed(2)}%`);
    insights.push(`2. Worst 30-day performance: ${worst[0]} averaged ${worst[1] >= 0 ? '+' : ''}${worst[1].toFixed(2)}%`);
  }

  // Check if "Buy Fear, Sell Greed" works
  const fearReturn = thirtyDayReturns['Fear'] || 0;
  const greedReturn = thirtyDayReturns['Greed'] || 0;

  if (fearReturn && greedReturn) {
    if (fearReturn > greedReturn) {
      insights.push(`3. "Buy Fear, Sell Greed" WORKS: Fear (+${fearReturn.toFixed(2)}%) outperformed Greed (+${greedReturn.toFixed(2)}%) by ${(fearReturn - greedReturn).toFixed(2)}%`);
    } else {
      insights.push(`3. "Buy Fear, Sell Greed" DOESN'T WORK: Greed (+${greedReturn.toFixed(2)}%) outperformed Fear (+${fearReturn.toFixed(2)}%) by ${(greedReturn - fearReturn).toFixed(2)}% - Momentum > Contrarian`);
    }
  }

  // Check win rates
  Object.entries(results).forEach(([rangeName, periods]) => {
    if (periods.day30.winRate >= 90) {
      insights.push(`4. ${rangeName} has exceptional reliability (${periods.day30.winRate.toFixed(1)}% win rate over 30 days)`);
    }
  });

  // Check for negative ranges
  Object.entries(thirtyDayReturns).forEach(([rangeName, avgReturn]) => {
    if (avgReturn < 0) {
      insights.push(`⚠️  WARNING: ${rangeName} has NEGATIVE average returns (${avgReturn.toFixed(2)}%)`);
    }
  });

  insights.forEach((insight, i) => {
    console.log(`   ${insight}`);
  });

  console.log();

  return insights;
}

/**
 * Save results to JSON file
 */
function saveResultsToFile(results, mergedData, insights) {
  const output = {
    metadata: {
      generatedAt: new Date().toISOString(),
      dataRange: {
        start: mergedData[0].date,
        end: mergedData[mergedData.length - 1].date,
        totalDays: mergedData.length
      },
      config: CONFIG
    },
    results: results,
    insights: insights,
    rawData: mergedData.slice(0, 10) // Include sample of first 10 days
  };

  const years = (mergedData.length / 365).toFixed(1);
  const filename = `backtest-results-${years}years.json`;
  fs.writeFileSync(filename, JSON.stringify(output, null, 2));
  console.log(`💾 Results saved to ${filename}\n`);
}

/**
 * Main execution
 */
async function main() {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔬 HINDSIGHT SCORE BACKTEST`);
  console.log(`${'='.repeat(80)}\n`);

  try {
    // Step 1: Fetch data
    const fgiData = await fetchHistoricalFGI();

    // Add delay to respect API rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));

    const btcData = await fetchHistoricalBTCPrices();

    // Step 2: Merge data
    const mergedData = mergeDataByDate(fgiData, btcData);

    if (mergedData.length === 0) {
      throw new Error('No overlapping data between FGI and BTC prices');
    }

    // Step 3: Calculate returns
    const dataWithReturns = calculateForwardReturns(mergedData);

    // Step 4: Analyze by range
    const results = analyzeReturnsByRange(dataWithReturns);

    // Step 5: Print results
    printResults(results);

    // Step 6: Generate insights
    const insights = generateInsights(results);

    // Step 7: Save to file
    saveResultsToFile(results, mergedData, insights);

    console.log(`✅ BACKTEST COMPLETE!\n`);
    console.log(`📋 Summary:`);
    console.log(`   • Analyzed ${mergedData.length} days of historical data`);
    console.log(`   • Tested ${CONFIG.FORWARD_PERIODS.length} forward-looking time periods`);
    console.log(`   • Evaluated ${Object.keys(CONFIG.FGI_RANGES).length} FGI ranges`);
    console.log(`   • Generated ${insights.length} actionable insights`);
    console.log();

  } catch (error) {
    console.error(`\n❌ BACKTEST FAILED:`, error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run main function
main();
