# FGI Terminal Design System

## 1. Visual Theme & Atmosphere

A dark financial terminal in the tradition of Bloomberg and TradingView: dense, calm, data-first. The interface is a neutral dark instrument panel; the data provides all the color. Nothing moves unless it communicates state. Nothing glows. The tone is institutional: a market data product, not a game.

**Key characteristics:**
- Dark, low-contrast surface stack; hierarchy via 1px borders and subtle surface steps, never shadows or glows
- All numerals in monospace with tabular figures so columns of data always align
- One accent color, used sparingly for interactivity
- Sentiment (FGI zones) is the only expressive color system, and it always ships with a text label
- No emoji in interface chrome, no decorative animation, no sound

## 2. Color Tokens

### Surfaces
| Token | Value | Use |
|---|---|---|
| `--bg-base` | `#0b0e14` | Page background, header |
| `--bg-surface` | `#11151c` | Cards, panels, modals |
| `--bg-raised` | `#171c24` | Hover states, nested panels, inputs |
| `--border` | `#2a303a` | All card/section borders (1px) |
| `--border-subtle` | `#1d222b` | Chart gridlines, hairline dividers inside panels |

### Text
| Token | Value | Use |
|---|---|---|
| `--text-primary` | `#e6edf3` | Headings, primary data values |
| `--text-secondary` | `#8b949e` | Labels, descriptions, axis ticks |
| `--text-muted` | `#484f58` | Timestamps, footnotes, disabled |

### Accent (the ONE loud color)
| Token | Value | Use |
|---|---|---|
| `--accent` | `#f7931a` | Links, active states, primary buttons, focus rings, chart highlight |

Accent is for interaction and emphasis only. It never fills large areas.

### Semantic deltas
| Token | Value | Use |
|---|---|---|
| `--up` | `#3fb950` | Positive 24h change |
| `--down` | `#f85149` | Negative 24h change |

Deltas only, never used decoratively.

### FGI zone scale
Thresholds: Extreme Fear ≤24 · Fear 25–44 · Neutral 45–59 · Greed 60–79 · Extreme Greed ≥80

| Zone | Token | Value |
|---|---|---|
| Extreme Fear | `--zone-xfear` | `#f85149` |
| Fear | `--zone-fear` | `#db6d28` |
| Neutral | `--zone-neutral` | `#d29922` |
| Greed | `--zone-greed` | `#3fb950` |
| Extreme Greed | `--zone-xgreed` | `#2ea043` |

Color is never the only signal: every zone-colored element carries the zone name as text.

## 3. Typography

- **UI / labels**: `Inter` (Google Fonts), fallback `system-ui, -apple-system, sans-serif`
- **Data / numerals / timestamps / tickers**: `JetBrains Mono` (Google Fonts), fallback `SF Mono, Menlo, monospace`
- `font-variant-numeric: tabular-nums` is mandatory on every numeric element.

| Role | Font | Size | Weight | Notes |
|---|---|---|---|---|
| FGI hero number | JetBrains Mono | 56px (72px ≥1200px) | 500 | The only oversized element |
| Section heading | Inter | 20px | 600 | |
| Card value | JetBrains Mono | 28px | 500 | Stat cards |
| Body | Inter | 14–16px | 400 | |
| Label (uppercase) | Inter | 11px | 600 | `letter-spacing: 0.08em; text-transform: uppercase; color: --text-secondary` |
| Timestamp / footnote | JetBrains Mono | 12px | 400 | `--text-muted` |

## 4. Components

Geometry is square: global radius 2px. Nothing rounded, nothing pill-shaped.

### Micro-labels (the signature)
Every label, section header, nav item, and button uses JetBrains Mono, 9-11px, uppercase, letter-spacing 0.08-0.12em. This is what makes the page read as a terminal.

### Header
Slim (52px), `--bg-base` with bottom border. Brand wordmark in mono. Nav items are text-only mono uppercase links (no borders, no fills); Refresh in accent color; live UTC clock at far right behind a hairline divider.

### Cards & strips
- Panels: `--bg-surface`, 1px `--border`, radius 2px, padding 20px
- Panel titles: mono uppercase micro-label with a hairline rule below
- **Stat strip**: related metrics share ONE bordered container, divided by vertical hairlines (`--border-subtle`), not separate gap-spaced cards. Table-like density over friendly cards.
- Hover (interactive only): border shifts to `--text-muted`. No transform, no shadow.

### Buttons
- **Primary**: ghost accent: transparent-ish accent tint background (8%), 1px `--accent` border, accent mono uppercase text. Never a solid orange fill.
- **Secondary**: transparent, 1px `--border`, `--text-secondary` mono uppercase text; hover brightens text and border
- **Active/selected state**: accent border + accent text + 8% accent tint
- Focus: 1px solid `--accent` outline with 2px offset

### Zone chip
Radius 2px, 1px border in zone color at 40% opacity, 8% zone-color tint background, zone color mono uppercase text, e.g. `EXTREME FEAR`.

### Gauge bar (FGI hero)
Horizontal 5-segment bar (6px tall, square ends), one segment per zone in zone colors at 30% opacity; the active zone segment at full opacity; segments separated by 2px background gaps; a marker line at the exact score position. Threshold numbers and zone names in mono micro-labels beneath.

### Modals
`--bg-surface`, 1px `--border`, radius 2px, backdrop `rgba(2,4,8,0.85)`. Header title is a mono uppercase micro-label. Max-width 560px, full-screen sheet under 768px.

### Charts (Chart.js)
- Gridlines `--border-subtle`, ticks in JetBrains Mono 11px `--text-secondary`
- Line chart: 2px line colored by zone segments or `--accent`; no fill or subtle 8% opacity fill
- Tooltips: `--bg-raised` background, 1px `--border`, mono values
- No chart animations beyond default ≤300ms initial draw

## 5. Layout & Spacing

- Base unit 4px; common steps 4/8/12/16/24/32
- Card padding 16px; gap between cards 12px; section gap 24px
- Max container width 1200px, centered, 16px side padding
- Breakpoints: 1200px (full grid), 768px (2-col stats, stacked charts), 375px (single column, mobile footer nav)

## 6. Motion

- Transitions: `border-color`, `background-color`, `color` at 120–150ms ease only
- No keyframe animations, no parallax, no floating/pulsing elements
- Optional single exception: FGI number count-up on first load, ≤600ms, ease-out

## 7. Voice & Copy

- Professional market commentary. Statements, not exclamations.
- **No em dashes anywhere in UI copy.** Use periods, colons, commas, or middle dots (·) instead.
- Zone descriptions: "Historically an accumulation zone", "Sentiment elevated above average", etc.
- Timestamps in UTC: "Updated 2026-07-19 00:00 UTC". The header shows a live UTC clock.
- No slang in UI chrome ("degen", "chad", "moon"), no ALL-CAPS hype outside mono micro-labels, no emoji in buttons/labels.
- Errors are plain: "Data unavailable. Retry."
- Feature names are analytical, not viral: "Historical Scenario Analysis", not "What Would $1,000 Become?"

## 8. Do / Don't

### Do
- Use mono + tabular-nums for every number
- Use 1px borders and surface steps for hierarchy
- Keep accent usage rare: if a screen has more than ~3 orange elements, remove some
- Pair every zone color with its text label
- Keep the interface still: data changes, chrome doesn't

### Don't
- No emoji in interface chrome
- No em dashes in UI copy
- No glows, neon, text-shadows, or gradients on chrome
- No decorative animations (rain, confetti, flicker, spin)
- No sound
- No radius above 2px, no pills, no circles (except chart doughnuts)
- No solid accent-filled buttons; accent appears as border + text + subtle tint
- No color outside the tokens above
