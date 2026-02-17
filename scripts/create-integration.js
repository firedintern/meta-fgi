/**
 * Script to create fully integrated website with Hindsight Score
 */

import fs from 'fs';

console.log('📦 Creating full integration...\n');

// Read the original index.html
const originalHTML = fs.readFileSync('index.html', 'utf8');

// Read the hindsight demo to extract components
const hindsightDemo = fs.readFileSync('hindsight-score-demo.html', 'utf8');

// Extract CSS from hindsight demo (lines after "/* Hindsight Score Section */")
const cssStart = hindsightDemo.indexOf('/* Hindsight Score Section */');
const cssEnd = hindsightDemo.indexOf('</style>');
const hindsightCSS = hindsightDemo.substring(cssStart, cssEnd);

// Extract HTML structure
const htmlStart = hindsightDemo.indexOf('<div class="hindsight-container"');
const htmlEnd = hindsightDemo.indexOf('</div>\n        </div>\n\n        <div style="text-align: center');
const hindsightHTML = hindsightDemo.substring(htmlStart, htmlEnd) + '</div>';

// Extract JavaScript
const jsStart = hindsightDemo.indexOf('// Real backtest data');
const jsEnd = hindsightDemo.lastIndexOf('</script>');
const hindsightJS = hindsightDemo.substring(jsStart, jsEnd);

// Now integrate into original HTML

// 1. Add CSS before the closing </style> tag
let integrated = originalHTML.replace(
  '        /* Mobile Adjustments for Portfolio */',
  `        /* ============================================ */
        /* HINDSIGHT SCORE STYLES */
        /* ============================================ */
        ${hindsightCSS}

        /* Mobile Adjustments for Portfolio */`
);

// 2. Add HTML after the chart container and before portfolio modal
integrated = integrated.replace(
  '        </div>\n    </div>\n\n    <!-- Portfolio Modal -->',
  `        </div>

        <!-- ============================================ -->
        <!-- HINDSIGHT SCORE SECTION -->
        <!-- ============================================ -->
        ${hindsightHTML}

    </div>

    <!-- Portfolio Modal -->`
);

// 3. Add JavaScript before the closing </script> tag (before the event listeners section)
integrated = integrated.replace(
  '        // Add event listeners for all interactive elements (CSP-friendly)',
  `        // ============================================
        // HINDSIGHT SCORE JAVASCRIPT
        // ============================================
        ${hindsightJS}

        // ============================================
        // ORIGINAL EVENT LISTENERS
        // ============================================
        // Add event listeners for all interactive elements (CSP-friendly)`
);

// 4. Hook hindsight into existing fetchData function
integrated = integrated.replace(
  '                // Update streak display\n                await updateStreakDisplay(currentScore);',
  `                // Update streak display
                await updateStreakDisplay(currentScore);

                // Update Hindsight Score
                updateHindsightScore(currentScore);`
);

// Save the integrated version
fs.writeFileSync('index-full-integration.html', integrated);

console.log('✅ Created: index-full-integration.html');
console.log('\n📋 Integration Summary:');
console.log('   • Added Hindsight Score CSS styles');
console.log('   • Inserted Hindsight Score HTML after 30-day chart');
console.log('   • Added Hindsight Score JavaScript functions');
console.log('   • Connected to existing fetchData() function');
console.log('\n🎉 Open index-full-integration.html to see the full integration!\n');
