/**
 * Test script to determine maximum historical data available from APIs
 */

console.log('🔍 Testing API Historical Data Limits...\n');

// Test Fear & Greed Index API
async function testFGILimit() {
  console.log('📊 Testing Fear & Greed Index API (alternative.me)...');

  try {
    // Try fetching maximum allowed (their docs say they have data since 2018)
    const limits = [365, 730, 1095, 1460, 1825, 2190]; // 1yr, 2yr, 3yr, 4yr, 5yr, 6yr

    for (const limit of limits) {
      const response = await fetch(`https://api.alternative.me/fng/?limit=${limit}&format=json`);
      const data = await response.json();

      if (data.data && Array.isArray(data.data)) {
        const actualCount = data.data.length;
        const oldestDate = new Date(parseInt(data.data[data.data.length - 1].timestamp) * 1000);
        const newestDate = new Date(parseInt(data.data[0].timestamp) * 1000);

        console.log(`   ✓ Requested ${limit} days → Got ${actualCount} days`);
        console.log(`     Range: ${oldestDate.toISOString().split('T')[0]} to ${newestDate.toISOString().split('T')[0]}`);

        if (actualCount < limit) {
          console.log(`   ⚠️  Hit limit at ${actualCount} days\n`);
          return {
            maxDays: actualCount,
            oldestDate: oldestDate,
            newestDate: newestDate
          };
        }
      }

      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('   ⚠️  Could fetch all tested limits, trying unlimited...\n');

    // Try without limit
    const response = await fetch(`https://api.alternative.me/fng/?limit=0&format=json`);
    const data = await response.json();

    if (data.data && Array.isArray(data.data)) {
      const actualCount = data.data.length;
      const oldestDate = new Date(parseInt(data.data[data.data.length - 1].timestamp) * 1000);
      const newestDate = new Date(parseInt(data.data[0].timestamp) * 1000);

      console.log(`   ✓ Unlimited request → Got ${actualCount} days`);
      console.log(`     Range: ${oldestDate.toISOString().split('T')[0]} to ${newestDate.toISOString().split('T')[0]}\n`);

      return {
        maxDays: actualCount,
        oldestDate: oldestDate,
        newestDate: newestDate
      };
    }

  } catch (error) {
    console.error('   ❌ Error:', error.message);
    return null;
  }
}

// Test Bitcoin Price API
async function testBTCLimit() {
  console.log('💰 Testing Bitcoin Price API (CoinGecko)...');

  try {
    // CoinGecko free tier limits: max 365 days with "daily" interval
    // But we can use "max" to get all historical data (less granular for older data)

    const tests = [
      { days: 365, interval: 'daily', name: '1 year (daily)' },
      { days: 730, interval: 'daily', name: '2 years (daily)' },
      { days: 'max', interval: null, name: 'Maximum available' }
    ];

    for (const test of tests) {
      let url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${test.days}`;
      if (test.interval) {
        url += `&interval=${test.interval}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        console.log(`   ⚠️  ${test.name}: HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();

      if (data.prices && Array.isArray(data.prices)) {
        const actualCount = data.prices.length;
        const oldestDate = new Date(data.prices[0][0]);
        const newestDate = new Date(data.prices[data.prices.length - 1][0]);
        const daysDiff = Math.floor((newestDate - oldestDate) / (1000 * 60 * 60 * 24));

        console.log(`   ✓ ${test.name}:`);
        console.log(`     Data points: ${actualCount}`);
        console.log(`     Range: ${oldestDate.toISOString().split('T')[0]} to ${newestDate.toISOString().split('T')[0]}`);
        console.log(`     Span: ${daysDiff} days\n`);

        if (test.days === 'max') {
          return {
            maxDays: daysDiff,
            dataPoints: actualCount,
            oldestDate: oldestDate,
            newestDate: newestDate
          };
        }
      }

      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

  } catch (error) {
    console.error('   ❌ Error:', error.message);
    return null;
  }
}

// Main execution
async function main() {
  console.log('=' .repeat(80));
  console.log('API HISTORICAL DATA LIMITS TEST');
  console.log('=' .repeat(80) + '\n');

  const fgiLimit = await testFGILimit();

  // Add delay between API tests
  await new Promise(resolve => setTimeout(resolve, 2000));

  const btcLimit = await testBTCLimit();

  console.log('=' .repeat(80));
  console.log('📊 SUMMARY');
  console.log('=' .repeat(80) + '\n');

  if (fgiLimit) {
    console.log('Fear & Greed Index (alternative.me):');
    console.log(`  • Maximum available: ${fgiLimit.maxDays} days`);
    console.log(`  • Oldest data: ${fgiLimit.oldestDate.toISOString().split('T')[0]}`);
    console.log(`  • Years of data: ${(fgiLimit.maxDays / 365).toFixed(2)} years\n`);
  }

  if (btcLimit) {
    console.log('Bitcoin Price (CoinGecko):');
    console.log(`  • Maximum available: ${btcLimit.maxDays} days`);
    console.log(`  • Data points: ${btcLimit.dataPoints}`);
    console.log(`  • Oldest data: ${btcLimit.oldestDate.toISOString().split('T')[0]}`);
    console.log(`  • Years of data: ${(btcLimit.maxDays / 365).toFixed(2)} years\n`);
  }

  // Determine overlap
  if (fgiLimit && btcLimit) {
    const maxUsableDays = Math.min(fgiLimit.maxDays, btcLimit.maxDays);
    const oldestUsableDate = fgiLimit.oldestDate > btcLimit.oldestDate ? fgiLimit.oldestDate : btcLimit.oldestDate;

    console.log('💡 RECOMMENDATION:');
    console.log(`  • Maximum usable period: ${maxUsableDays} days (${(maxUsableDays / 365).toFixed(2)} years)`);
    console.log(`  • Start date: ${oldestUsableDate.toISOString().split('T')[0]}`);
    console.log(`  • This ensures both datasets have complete overlap\n`);

    // Calculate years for different market cycles
    console.log('📈 MARKET CYCLE CONTEXT:');
    console.log(`  • 1 year: Captures recent momentum`);
    console.log(`  • 2 years: Includes at least one cycle`);
    console.log(`  • 3+ years: Multiple cycles, more robust`);
    console.log(`  • ${(maxUsableDays / 365).toFixed(2)} years: Maximum available\n`);

    return maxUsableDays;
  }

  return null;
}

main().then(maxDays => {
  if (maxDays) {
    console.log(`\n✅ You can backtest up to ${maxDays} days (${(maxDays / 365).toFixed(2)} years)`);
    console.log(`   Recommend using full historical data for most robust results.\n`);
  }
});
