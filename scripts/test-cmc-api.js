/**
 * Test CoinMarketCap API for Fear & Greed Index data
 * Checking what's available on the FREE tier
 */

console.log('🔍 Testing CoinMarketCap API for FGI data...\n');

// Test 1: Check if there's a public endpoint (no API key)
async function testPublicEndpoint() {
  console.log('1️⃣  Testing Public Endpoint (no API key)');
  console.log('   Trying: https://coinmarketcap.com/api/fear-and-greed-index\n');

  try {
    const response = await fetch('https://coinmarketcap.com/api/fear-and-greed-index');

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ SUCCESS! Got data:');
      console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...\n');
      return data;
    } else {
      console.log(`   ❌ Failed: ${response.status}\n`);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    return null;
  }
}

// Test 2: Try the charts endpoint (might have historical data)
async function testChartsEndpoint() {
  console.log('2️⃣  Testing Charts Endpoint');
  console.log('   Trying: https://coinmarketcap.com/api/charts/fear-and-greed-index\n');

  try {
    const response = await fetch('https://coinmarketcap.com/api/charts/fear-and-greed-index');

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ SUCCESS! Got data:');
      console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...\n');
      return data;
    } else {
      console.log(`   ❌ Failed: ${response.status}\n`);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    return null;
  }
}

// Test 3: Try scraping the page directly
async function testPageScrape() {
  console.log('3️⃣  Testing Page Scrape (if no API available)');
  console.log('   Fetching: https://coinmarketcap.com/charts/fear-and-greed-index/\n');

  try {
    const response = await fetch('https://coinmarketcap.com/charts/fear-and-greed-index/');

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const html = await response.text();

      // Look for JSON data in the HTML
      const scriptMatch = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);

      if (scriptMatch) {
        console.log('   ✅ Found __NEXT_DATA__ in page');
        const jsonData = JSON.parse(scriptMatch[1]);
        console.log('   Data keys:', Object.keys(jsonData));

        // Try to find the FGI data
        const pageProps = jsonData?.props?.pageProps;
        if (pageProps) {
          console.log('   PageProps keys:', Object.keys(pageProps));
          console.log('\n   Sample data:');
          console.log(JSON.stringify(pageProps, null, 2).substring(0, 1000) + '...\n');
          return pageProps;
        }
      } else {
        console.log('   ⚠️  No __NEXT_DATA__ found, page structure may have changed\n');
      }

      return html;
    } else {
      console.log(`   ❌ Failed: ${response.status}\n`);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    return null;
  }
}

// Test 4: Try the API with common patterns
async function testAPIVariations() {
  console.log('4️⃣  Testing API Variations\n');

  const endpoints = [
    'https://api.coinmarketcap.com/data-api/v3/fear-and-greed-index',
    'https://api.coinmarketcap.com/data-api/v3/fear-greed-index',
    'https://pro-api.coinmarketcap.com/v1/fear-greed-index',
    'https://coinmarketcap.com/data-api/v3/fear-and-greed-index',
    'https://coinmarketcap.com/data-api/v3/fear-and-greed-index/latest',
  ];

  for (const endpoint of endpoints) {
    console.log(`   Testing: ${endpoint}`);
    try {
      const response = await fetch(endpoint);
      console.log(`   → Status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ SUCCESS!');
        console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...\n');
        return data;
      }
    } catch (error) {
      console.log(`   → Error: ${error.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n');
  return null;
}

// Main execution
async function main() {
  console.log('='.repeat(80));
  console.log('COINMARKETCAP FEAR & GREED INDEX API TEST');
  console.log('='.repeat(80) + '\n');

  // Try all methods
  let data;

  data = await testPublicEndpoint();
  if (data) {
    console.log('🎉 Found working endpoint! Using public API.\n');
    analyzeData(data);
    return;
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  data = await testChartsEndpoint();
  if (data) {
    console.log('🎉 Found working charts endpoint!\n');
    analyzeData(data);
    return;
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  data = await testAPIVariations();
  if (data) {
    console.log('🎉 Found working API variation!\n');
    analyzeData(data);
    return;
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  data = await testPageScrape();
  if (data) {
    console.log('🎉 Can scrape page data!\n');
    analyzeScrapedData(data);
    return;
  }

  console.log('=' .repeat(80));
  console.log('❌ RESULT: No free API access found');
  console.log('=' .repeat(80));
  console.log('\nAlternatives:');
  console.log('1. Use Alternative.me API (current method)');
  console.log('2. Scrape CMC page (more fragile, may break)');
  console.log('3. Use CMC Pro API (requires paid subscription)');
  console.log('4. Manual data collection from CMC chart\n');
}

function analyzeData(data) {
  console.log('📊 Analyzing Data Structure...\n');

  if (Array.isArray(data)) {
    console.log(`   • Array with ${data.length} items`);
    if (data.length > 0) {
      console.log('   • First item:', JSON.stringify(data[0], null, 2));
      console.log('   • Last item:', JSON.stringify(data[data.length - 1], null, 2));
    }
  } else if (typeof data === 'object') {
    console.log('   • Keys:', Object.keys(data));

    // Look for common data patterns
    if (data.data) console.log('   • Has "data" property');
    if (data.values) console.log('   • Has "values" property');
    if (data.historical) console.log('   • Has "historical" property');
  }

  console.log('\n');
}

function analyzeScrapedData(data) {
  console.log('📊 Analyzing Scraped Data...\n');

  if (typeof data === 'string') {
    console.log('   • Got HTML string');
    console.log('   • Length:', data.length, 'characters');

    // Try to find data patterns
    const patterns = [
      'fear-and-greed',
      'fearAndGreed',
      'fgi',
      'sentiment',
      'index',
    ];

    patterns.forEach(pattern => {
      const matches = data.match(new RegExp(pattern, 'gi'));
      if (matches) {
        console.log(`   • Found "${pattern}" ${matches.length} times`);
      }
    });
  } else if (typeof data === 'object') {
    analyzeData(data);
  }

  console.log('\n');
}

main();
