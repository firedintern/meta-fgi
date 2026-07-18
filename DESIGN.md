# FGI Terminal — Design System

## 1. Visual Theme & Atmosphere

A dark financial terminal in the tradition of Bloomberg and TradingView: dense, calm, data-first. The interface is a neutral dark instrument panel; the data provides all the color. Nothing moves unless it communicates state. Nothing glows. The tone is institutional — a market data product, not a game.

**Key characteristics:**
- Dark, low-contrast surface stack; hierarchy via 1px borders and subtle surface steps, never shadows or glows
- All numerals in monospace with tabular figures — columns of data always align
- One accent color, used sparingly for interactivity
- Sentiment (FGI zones) is the only expressive color system, and it always ships with a text label
- No emoji in interface chrome, no decorative animation, no sound

## 2. Color Tokens

### Surfaces
| Token | Value | Use |
|---|---|---|
| `--bg-base` | `#0d1117` | Page background |
| `--bg-surface` | `#161b22` | Cards, header, modals |
| `--bg-raised` | `#1c2128` | Hover states, nested panels, inputs |
| `--border` | `#30363d` | All card/section borders (1px) |
| `--border-subtle` | `#21262d` | Chart gridlines, dividers |

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

Deltas only — never used decoratively.

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

### Cards
- `--bg-surface`, 1px `--border`, radius 6px, padding 16px
- Uppercase 11px label top-left; value below in mono
- Hover (interactive cards only): border shifts to `#8b949e`. No transform, no shadow.

### Buttons
- **Primary**: `--accent` background, `#0d1117` text, radius 6px, 8px 16px padding
- **Secondary**: transparent, 1px `--border`, `--text-primary` text; hover raises to `--bg-raised`
- **Text/link**: `--accent`, no underline until hover
- Focus: 2px solid `--accent` outline with 2px offset

### Zone chip
Pill (radius 4px), zone color at 15% opacity background, zone color text, uppercase 12px mono label — e.g. `EXTREME FEAR`.

### Gauge bar (FGI hero)
Horizontal 5-segment bar, one segment per zone in zone colors at 35% opacity; the active zone segment at full opacity; a marker line at the exact score position.

### Modals
`--bg-surface`, 1px `--border`, radius 8px, backdrop `rgba(1,4,9,0.8)`. Header with title + close button. Max-width 560px, full-screen sheet under 768px.

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
- Zone descriptions: "Extreme fear — historically an accumulation zone", "Greed — sentiment elevated", etc.
- No slang in UI chrome ("degen", "chad", "moon"), no ALL-CAPS hype, no emoji in buttons/labels.
- Errors are plain: "Data unavailable. Retry."

## 8. Do / Don't

### Do
- Use mono + tabular-nums for every number
- Use 1px borders and surface steps for hierarchy
- Keep accent usage rare — if a screen has more than ~3 orange elements, remove some
- Pair every zone color with its text label
- Keep the interface still: data changes, chrome doesn't

### Don't
- No emoji in interface chrome
- No glows, neon, text-shadows, or gradients on chrome
- No decorative animations (rain, confetti, flicker, spin)
- No sound
- No rounded pills >8px radius except the zone chip
- No color outside the tokens above
