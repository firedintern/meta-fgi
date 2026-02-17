/**
 * Extract Fear & Greed Index data from CoinMarketCap page
 */

console.log('🔍 Extracting FGI data from CoinMarketCap...\n');

async function fetchCMCPage() {
  const response = await fetch('https://coinmarketcap.com/charts/fear-and-greed-index/');
  const html = await response.text();

  // Extract __NEXT_DATA__
  const scriptMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);

  if (!scriptMatch) {
    throw new Error('Could not find __NEXT_DATA__ in page');
  }

  return JSON.parse(scriptMatch[1]);
}

async function main() {
  console.log('Fetching CMC Fear & Greed Index page...');

  const nextData = await fetchCMCPage();

  console.log('\n📦 Top-level structure:');
  console.log('  Keys:', Object.keys(nextData));

  const props = nextData.props;
  console.log('\n📦 Props structure:');
  console.log('  Keys:', Object.keys(props));

  const pageProps = props.pageProps;
  console.log('\n📦 PageProps structure:');
  console.log('  Keys:', Object.keys(pageProps));

  // Dig deeper into pageSharedData
  if (pageProps.pageSharedData) {
    console.log('\n📦 PageSharedData structure:');
    console.log('  Keys:', Object.keys(pageProps.pageSharedData));

    // Save full pageSharedData to see what's inside
    const fs = await import('fs');
    fs.writeFileSync(
      'cmc-page-shared-data.json',
      JSON.stringify(pageProps.pageSharedData, null, 2)
    );
    console.log('  ✅ Saved to cmc-page-shared-data.json');
  }

  // Look for any property that might contain chart/historical data
  console.log('\n🔍 Searching for FGI data...');

  function searchForFGI(obj, path = '') {
    if (obj === null || obj === undefined) return;

    if (typeof obj !== 'object') return;

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;

      // Look for promising keys
      if (
        key.toLowerCase().includes('fear') ||
        key.toLowerCase().includes('greed') ||
        key.toLowerCase().includes('fgi') ||
        key.toLowerCase().includes('sentiment') ||
        key.toLowerCase().includes('chart') ||
        key.toLowerCase().includes('data')
      ) {
        console.log(`\n  Found: ${currentPath}`);
        console.log(`  Type: ${Array.isArray(value) ? 'Array' : typeof value}`);

        if (Array.isArray(value) && value.length > 0) {
          console.log(`  Length: ${value.length}`);
          console.log(`  First item:`, JSON.stringify(value[0]).substring(0, 200));
          console.log(`  Last item:`, JSON.stringify(value[value.length - 1]).substring(0, 200));
        } else if (typeof value === 'object' && value !== null) {
          console.log(`  Keys:`, Object.keys(value).slice(0, 10));
        }
      }

      // Recurse (but limit depth to avoid infinite loops)
      if (path.split('.').length < 5 && typeof value === 'object' && value !== null) {
        searchForFGI(value, currentPath);
      }
    }
  }

  searchForFGI(pageProps);

  console.log('\n' + '='.repeat(80));
  console.log('💡 NEXT STEP: Check cmc-page-shared-data.json for the actual FGI data');
  console.log('='.repeat(80) + '\n');
}

main().catch(console.error);
