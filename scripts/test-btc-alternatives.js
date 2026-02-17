/**
 * Test alternative Bitcoin price data sources for extended historical data
 */

console.log('🔍 Testing Alternative Bitcoin Price Data Sources...\n');

// Option 1: CoinGecko with "max" days (simpler intervals for old data)
async function testCoinGeckoMax() {
  console.log('1️⃣  CoinGecko - Maximum Historical Data');
  console.log('   (Uses automatic interval selection for old data)\n');

  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=max'
    );

    if (!response.ok) {
      console.log(`   ❌ HTTP ${response.status}: ${response.statusText}\n`);
      return null;
    }

    const data = await response.json();

    if (data.prices && Array.isArray(data.prices)) {
      const count = data.prices.length;
      const oldestDate = new Date(data.prices[0][0]);
      const newestDate = new Date(data.prices[count - 1][0]);
      const days = Math.floor((newestDate - oldestDate) / (1000 * 60 * 60 * 24));

      console.log(`   ✅ Success!`);
      console.log(`   • Data points: ${count}`);
      console.log(`   • Range: ${oldestDate.toISOString().split('T')[0]} to ${newestDate.toISOString().split('T')[0]}`);
      console.log(`   • Span: ${days} days (${(days / 365).toFixed(2)} years)`);
      console.log(`   • Granularity: ~${(days / count).toFixed(1)} days per point\n`);

      return {
        source: 'CoinGecko (max)',
        days: days,
        dataPoints: count,
        oldestDate: oldestDate,
        granularity: days / count
      };
    }

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}\n`);
    return null;
  }
}

// Option 2: CoinGecko historical price by date range
async function testCoinGeckoDateRange() {
  console.log('2️⃣  CoinGecko - Historical Price by Date Range');
  console.log('   (Fetch specific dates from 2018 onwards)\n');

  try {
    // Test fetching price for a specific old date
    const testDate = '01-02-2018'; // Feb 1, 2018 (dd-mm-yyyy)

    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${testDate}`
    );

    if (!response.ok) {
      console.log(`   ❌ HTTP ${response.status}: ${response.statusText}\n`);
      return null;
    }

    const data = await response.json();

    if (data.market_data && data.market_data.current_price) {
      const price = data.market_data.current_price.usd;
      console.log(`   ✅ Success!`);
      console.log(`   • Can fetch historical prices by date`);
      console.log(`   • Example: ${testDate} → $${price.toLocaleString()}`);
      console.log(`   • Method: Make one API call per day needed`);
      console.log(`   • Limitation: Rate limits (10-50 calls/min free tier)\n`);

      return {
        source: 'CoinGecko (history endpoint)',
        method: 'individual_dates',
        rateLimit: '10-50 calls/min'
      };
    }

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}\n`);
    return null;
  }
}

// Option 3: Check if CryptoCompare API works
async function testCryptoCompare() {
  console.log('3️⃣  CryptoCompare API (Alternative Source)');
  console.log('   (Free tier, good historical data)\n');

  try {
    // CryptoCompare allows up to 2000 days of daily data
    const response = await fetch(
      'https://min-api.cryptocompare.com/data/v2/histoday?fsym=BTC&tsym=USD&limit=2000'
    );

    if (!response.ok) {
      console.log(`   ❌ HTTP ${response.status}: ${response.statusText}\n`);
      return null;
    }

    const data = await response.json();

    if (data.Data && data.Data.Data && Array.isArray(data.Data.Data)) {
      const prices = data.Data.Data;
      const count = prices.length;
      const oldestDate = new Date(prices[0].time * 1000);
      const newestDate = new Date(prices[count - 1].time * 1000);
      const days = Math.floor((newestDate - oldestDate) / (1000 * 60 * 60 * 24));

      console.log(`   ✅ Success!`);
      console.log(`   • Data points: ${count}`);
      console.log(`   • Range: ${oldestDate.toISOString().split('T')[0]} to ${newestDate.toISOString().split('T')[0]}`);
      console.log(`   • Span: ${days} days (${(days / 365).toFixed(2)} years)`);
      console.log(`   • Granularity: Daily`);
      console.log(`   • Rate limit: 100,000 calls/month (free tier)\n`);

      return {
        source: 'CryptoCompare',
        days: days,
        dataPoints: count,
        oldestDate: oldestDate,
        granularity: 'daily'
      };
    }

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}\n`);
    return null;
  }
}

async function main() {
  console.log('='.repeat(80));
  console.log('BITCOIN PRICE DATA SOURCES COMPARISON');
  console.log('='.repeat(80) + '\n');

  const results = [];

  // Test all sources
  const coingeckoMax = await testCoinGeckoMax();
  if (coingeckoMax) results.push(coingeckoMax);

  await new Promise(resolve => setTimeout(resolve, 1500));

  const coingeckoDate = await testCoinGeckoDateRange();
  if (coingeckoDate) results.push(coingeckoDate);

  await new Promise(resolve => setTimeout(resolve, 1500));

  const cryptocompare = await testCryptoCompare();
  if (cryptocompare) results.push(cryptocompare);

  // Summary
  console.log('='.repeat(80));
  console.log('📊 RECOMMENDATION');
  console.log('='.repeat(80) + '\n');

  console.log('Best option for extended backtest:\n');

  if (cryptocompare && cryptocompare.days > 1000) {
    console.log('✅ Use CryptoCompare API');
    console.log(`   • ${cryptocompare.days} days (${(cryptocompare.days / 365).toFixed(2)} years) of daily data`);
    console.log(`   • Free tier: 100,000 calls/month`);
    console.log(`   • Daily granularity (perfect for our needs)`);
    console.log(`   • Simple implementation\n`);

    console.log('📝 Implementation:');
    console.log('   Replace CoinGecko calls with:');
    console.log('   https://min-api.cryptocompare.com/data/v2/histoday?fsym=BTC&tsym=USD&limit=2000\n');

    return { recommended: 'CryptoCompare', maxDays: cryptocompare.days };
  }

  if (coingeckoMax && coingeckoMax.days > 1000) {
    console.log('⚠️  Use CoinGecko "max" endpoint (with lower granularity)');
    console.log(`   • ${coingeckoMax.days} days (${(coingeckoMax.days / 365).toFixed(2)} years)`);
    console.log(`   • Granularity: ~${coingeckoMax.granularity.toFixed(1)} days per point`);
    console.log(`   • May need interpolation for daily prices`);
    console.log(`   • Free, no API key needed\n`);

    return { recommended: 'CoinGecko-max', maxDays: coingeckoMax.days };
  }

  console.log('❌ Limited to 1 year of data with current free tier APIs\n');
  console.log('Alternatives:');
  console.log('   1. Use CryptoCompare (best free option)');
  console.log('   2. Upgrade to CoinGecko Pro ($129/mo for historical API)');
  console.log('   3. Use Yahoo Finance library (free, good historical data)\n');

  return null;
}

main();
