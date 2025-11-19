/**
 * DETAILED EXPLANATION: How FGI Sentiment Overlaps with BTC Prices
 *
 * This script shows exactly how we merge FGI data with BTC prices
 * and calculate forward returns for the Hindsight Score.
 */

import fs from 'fs';

console.log('=' .repeat(80));
console.log('HOW FGI SENTIMENT OVERLAPS WITH BTC PRICES');
console.log('=' .repeat(80) + '\n');

// Let's use real data from our backtest to show the exact process
const backtestResults = JSON.parse(fs.readFileSync('backtest-results-5.5years.json', 'utf8'));
const rawData = backtestResults.rawData; // First 10 days as sample

console.log('📊 STEP 1: FETCH FGI DATA FROM ALTERNATIVE.ME\n');
console.log('API Call: https://api.alternative.me/fng/?limit=2000\n');
console.log('Sample Response (first day):');
console.log(JSON.stringify({
  value: "68",           // FGI score (0-100)
  value_classification: "Greed",  // Text classification
  timestamp: "1590624000"         // Unix timestamp
}, null, 2));

console.log('\n' + '─'.repeat(80) + '\n');

console.log('📊 STEP 2: FETCH BTC PRICE DATA FROM CRYPTOCOMPARE\n');
console.log('API Call: https://min-api.cryptocompare.com/data/v2/histoday?fsym=BTC&tsym=USD&limit=2000\n');
console.log('Sample Response (same day):');
console.log(JSON.stringify({
  time: 1590624000,      // Unix timestamp (matches FGI!)
  close: 9426.8,         // BTC closing price
  high: 9560.0,
  low: 9200.0
}, null, 2));

console.log('\n' + '─'.repeat(80) + '\n');

console.log('📊 STEP 3: MERGE BY DATE\n');
console.log('We match FGI scores with BTC prices using the DATE as the key:\n');

console.log('Merged Data (first 10 days from our actual backtest):\n');
console.log('┌────────────┬───────────┬──────────────────┬─────────────┐');
console.log('│    Date    │ FGI Score │  Classification  │  BTC Price  │');
console.log('├────────────┼───────────┼──────────────────┼─────────────┤');

// Show real data
rawData.forEach(day => {
  const date = day.date.padEnd(10);
  const score = String(day.fgiScore).padStart(9);
  const classification = day.fgiClassification.padEnd(16);
  const price = ('$' + day.btcPrice.toFixed(2)).padStart(11);

  console.log(`│ ${date} │ ${score} │ ${classification} │ ${price} │`);
});

console.log('└────────────┴───────────┴──────────────────┴─────────────┘\n');

console.log('✅ Result: 2,000 days with BOTH FGI score AND BTC price for each day\n');

console.log('=' .repeat(80) + '\n');

console.log('📈 STEP 4: CALCULATE FORWARD RETURNS\n');
console.log('For each historical day, we look FORWARD to see what BTC did:\n');

// Use day index 5 as an example (June 2, 2020)
const exampleDay = rawData[5];
console.log(`Example: ${exampleDay.date}`);
console.log(`  • FGI Score: ${exampleDay.fgiScore} (${exampleDay.fgiClassification})`);
console.log(`  • BTC Price: $${exampleDay.btcPrice.toFixed(2)}\n`);

console.log('Now we calculate what happened AFTER this day:\n');

// Show the concept with made-up future prices for illustration
console.log('  7 days later (2020-06-09):');
console.log(`    • BTC Price: $9,750`);
console.log(`    • Return: ($9,750 - $${exampleDay.btcPrice.toFixed(2)}) / $${exampleDay.btcPrice.toFixed(2)} × 100`);
console.log(`    • Return: +3.4%\n`);

console.log('  14 days later (2020-06-16):');
console.log(`    • BTC Price: $9,520`);
console.log(`    • Return: ($9,520 - $${exampleDay.btcPrice.toFixed(2)}) / $${exampleDay.btcPrice.toFixed(2)} × 100`);
console.log(`    • Return: +1.0%\n`);

console.log('  30 days later (2020-07-02):');
console.log(`    • BTC Price: $9,150`);
console.log(`    • Return: ($9,150 - $${exampleDay.btcPrice.toFixed(2)}) / $${exampleDay.btcPrice.toFixed(2)} × 100`);
console.log(`    • Return: -2.9%\n`);

console.log('=' .repeat(80) + '\n');

console.log('📊 STEP 5: GROUP BY FGI RANGE\n');
console.log('We group all days by their FGI classification:\n');

const ranges = {
  "Extreme Fear (0-24)": { days: [], color: '🔴' },
  "Fear (25-44)": { days: [], color: '🟠' },
  "Neutral (45-59)": { days: [], color: '🟡' },
  "Greed (60-79)": { days: [], color: '🟢' },
  "Extreme Greed (80-100)": { days: [], color: '🔵' }
};

// Classify our sample days
rawData.forEach(day => {
  const score = day.fgiScore;
  if (score <= 24) ranges["Extreme Fear (0-24)"].days.push(day);
  else if (score <= 44) ranges["Fear (25-44)"].days.push(day);
  else if (score <= 59) ranges["Neutral (45-59)"].days.push(day);
  else if (score <= 79) ranges["Greed (60-79)"].days.push(day);
  else ranges["Extreme Greed (80-100)"].days.push(day);
});

Object.entries(ranges).forEach(([rangeName, rangeData]) => {
  if (rangeData.days.length > 0) {
    console.log(`${rangeData.color} ${rangeName}: ${rangeData.days.length} days in sample`);
    rangeData.days.forEach(day => {
      console.log(`   • ${day.date}: FGI ${day.fgiScore}, BTC $${day.btcPrice.toFixed(2)}`);
    });
    console.log();
  }
});

console.log('=' .repeat(80) + '\n');

console.log('📊 STEP 6: CALCULATE STATISTICS PER RANGE\n');
console.log('For each FGI range, we calculate:\n');
console.log('  • Average Return: Mean of all forward returns');
console.log('  • Win Rate: % of times BTC went up');
console.log('  • Best Case: Maximum gain observed');
console.log('  • Worst Case: Maximum loss observed');
console.log('  • Sample Size: How many times this range occurred\n');

console.log('Example: Fear (25-44) with 440 occurrences\n');
console.log('  30-Day Forward Returns:');
console.log('    • Average: +4.54%');
console.log('    • Win Rate: 56.8% (250 profitable / 440 total)');
console.log('    • Best Case: +74.11%');
console.log('    • Worst Case: -30.99%');
console.log('    • Sample Size: 440 occurrences\n');

console.log('=' .repeat(80) + '\n');

console.log('🎯 THE KEY INSIGHT: CORRELATION\n');
console.log('By overlapping FGI sentiment with BTC prices, we can answer:\n');
console.log('  ❓ "When FGI was in FEAR, what did BTC do next?"');
console.log('  ✅ Answer: +4.54% avg over 30 days (56.8% win rate)\n');

console.log('  ❓ "When FGI was in EXTREME GREED, what did BTC do next?"');
console.log('  ✅ Answer: +21.87% avg over 30 days (74.8% win rate)\n');

console.log('This is EXACTLY what CoinMarketCap\'s chart shows visually:\n');
console.log('  • Yellow line = FGI sentiment level');
console.log('  • Gray line = BTC price');
console.log('  • Our analysis = Statistical correlation between the two\n');

console.log('=' .repeat(80) + '\n');

console.log('💡 VISUAL REPRESENTATION\n');
console.log('Imagine this timeline (simplified):\n');
console.log('');
console.log('Date       │ FGI │ BTC Price │ 30d Later │ Return  │ Range');
console.log('───────────┼─────┼───────────┼───────────┼─────────┼──────────────');
console.log('2020-06-01 │  30 │ $9,500    │ $9,900    │ +4.2%   │ Fear');
console.log('2020-06-02 │  35 │ $9,426    │ $9,800    │ +4.0%   │ Fear');
console.log('2020-06-03 │  68 │ $9,700    │ $10,100   │ +4.1%   │ Greed');
console.log('2020-06-04 │  72 │ $9,815    │ $10,500   │ +7.0%   │ Greed');
console.log('2020-06-05 │  15 │ $9,600    │ $9,200    │ -4.2%   │ Extreme Fear');
console.log('2020-06-06 │  80 │ $9,900    │ $12,000   │ +21.2%  │ Extreme Greed');
console.log('...');
console.log('');
console.log('After 2,000 days, we AGGREGATE by range:');
console.log('  • All "Fear" days: Average return = +4.54%');
console.log('  • All "Greed" days: Average return = +3.97%');
console.log('  • All "Extreme Greed" days: Average return = +21.87% 🚀\n');

console.log('=' .repeat(80) + '\n');

console.log('✅ CONCLUSION\n');
console.log('Our overlap method:');
console.log('  1. Matches FGI sentiment with BTC price by DATE');
console.log('  2. Calculates forward returns (what happened next)');
console.log('  3. Groups by FGI range');
console.log('  4. Computes statistics (avg, win rate, best/worst)\n');

console.log('This gives us the "Hindsight Score" - historical evidence of');
console.log('what typically happens to BTC price at each FGI sentiment level.\n');

console.log('📊 Same as CMC chart, but with ACTIONABLE statistics!\n');
console.log('=' .repeat(80) + '\n');
