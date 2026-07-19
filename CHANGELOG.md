# Changelog

All notable changes to FGI CHAD are documented here.
Format: [MAJOR.MINOR.PATCH.MICRO] - YYYY-MM-DD

## [1.0.0.0] - 2026-07-19

### Changed
- Complete redesign as a dark financial terminal: FGI hero with zone gauge and delta vs yesterday, hairline-divided stat strip, uppercase mono labels, live UTC header clock, square geometry, one restrained Bitcoin-orange accent
- Frontend split from a single 4,898-line index.html into index.html + styles.css + app.js (no build step)
- Typography moved to Inter + JetBrains Mono with tabular numerals
- All copy rewritten in a professional voice: sentiment signals, portfolio advice, share text, API labels; timestamps now in UTC
- Scenario tool renamed Historical Scenario Analysis; sentiment thresholds unified to the canonical bands (Extreme Fear ≤24, Fear 25-44, Neutral 45-59, Greed 60-79, Extreme Greed ≥80) across score display, streaks, and charts
- BTC price fallback switched from the sunset CoinCap API to the Binance public ticker

### Added
- Change vs yesterday on the FGI reading, five-band gauge with position marker
- Subresource integrity on the Chart.js CDN script
- Design system documented in DESIGN.md; VERSION and CHANGELOG introduced

### Fixed
- Corrupt localStorage portfolio data no longer disables all page interactivity
- Invalid FGI API values render an error state instead of a false Extreme Greed reading
- Share on X can no longer post placeholder 0/100 data before the first fetch completes
- Sentiment charts render even when the BTC price history API is unavailable
- Gauge threshold numbers positioned at their true scale positions

### Removed
- Casino visuals: slot machine, jackpot sounds, emoji rain, matrix rain, confetti, neon styling, emoji chrome
- Dead files: experimental drafts, vendored workflow templates, unused data files, one-off research scripts, 53 committed test screenshots
