# Design System — FGI CHAD

## Product Context
- **What this is:** Real-time crypto Fear & Greed Index dashboard with slot machine visualization, Telegram alerts, strategy backtester, and viral data sharing.
- **Who it's for:** Crypto degens — people who want the sentiment edge with a bit of entertainment. The slot machine is the hook; the data is the value.
- **Space/industry:** Crypto data / sentiment tracking
- **Project type:** Single-page web app (vanilla JS, no framework)

## Aesthetic Direction
- **Direction:** Retro-Futuristic Casino (Vegas degen underground)
- **Decoration level:** Intentional — the slot machine carries the decoration. Everything else is clean.
- **Mood:** A real casino floor at 2am. High contrast, amber and gold against near-black. Feels sharp and alive, not generic crypto. The slot machine should feel like the centerpiece of the room; everything else is the felt table it sits on.
- **Key decision:** Matrix rain stays as a user-toggled Easter egg (✨ button), NOT the default background. The data is the product now — the rain is a treat, not wallpaper.

## Typography
- **Display/Hero:** Bebas Neue — tall, geometric, ALL CAPS. Casino signage energy. Used for page title, section headings, large stat numbers.
- **Body/data:** Chakra Petch — monospace-adjacent, works for data labels, button text, body copy. Keep as-is.
- **Numbers/stats:** Chakra Petch with `font-variant-numeric: tabular-nums` on all financial/numeric columns.
- **Code:** Chakra Petch (already monospace, sufficient)
- **Loading:** Google Fonts CDN. Add Bebas Neue: `https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Chakra+Petch:wght@400;600;700&display=swap`
- **Scale:**
  - Display XL: 3.5–4rem (Bebas Neue) — page title
  - Display LG: 2.2rem (Bebas Neue) — FGI score number, large stats
  - Display MD: 1.4rem (Bebas Neue) — section headings
  - Body: 0.95rem (Chakra Petch) — copy, labels
  - Caption: 0.75rem (Chakra Petch) — secondary labels, disclaimers

## Color
- **Approach:** Restrained — orange is the ONE loud color. Everything else is calm.
- **Background:** `#080c10` — near-black, slightly cool/blue. Deeper than current `#0a0e14`.
- **Surface 1:** `#0f141a` — cards, sections (darker elevation)
- **Surface 2:** `#141c24` — elevated cards, modals (lighter elevation)
- **Surface 3:** `#1a2332` — borders, subtle separators
- **Primary (Orange):** `#f7931a` — Bitcoin's color. The only electric color. Used for: slot machine border, primary CTAs, key accent lines.
- **Secondary (Gold):** `#ffd700` — Section divider lines, investment slider thumb, secondary highlights. Precious, not loud.
- **Green (positive):** `#27ae60` — Deep forest green. Calm, readable, clearly "up". NOT neon. Used for: positive returns, win states, SPIN button, FGI CHAD title.
- **Red (negative):** `#c0392b` — Deep crimson. Clearly "down" without alarming. Used for: negative returns, Extreme Fear state, loss indicators.
- **Text 1:** `#e8eaed` — Primary body text. High contrast on all surface levels.
- **Text 2:** `#8a9ab0` — Secondary text, labels, subtitles.
- **Text 3:** `#4a5568` — Muted text, disclaimers, placeholders.
- **Dark mode:** This IS dark mode. No light mode required for this product.

### CSS Custom Properties (add to :root in index.html)
```css
:root {
  --color-bg:        #080c10;
  --color-surface-1: #0f141a;
  --color-surface-2: #141c24;
  --color-surface-3: #1a2332;
  --color-orange:    #f7931a;
  --color-gold:      #ffd700;
  --color-green:     #27ae60;
  --color-red:       #c0392b;
  --color-text-1:    #e8eaed;
  --color-text-2:    #8a9ab0;
  --color-text-3:    #4a5568;
}
```

## Spacing
- **Base unit:** 8px
- **Density:** Comfortable (crypto degens read fast but also stare at screens for hours)
- **Scale:** 4 / 8 / 16 / 24 / 32 / 48 / 64px
- **Section padding:** 30px desktop, 20px mobile (keep current, it works)

## Layout
- **Approach:** Grid-disciplined — strict single-column layout, no asymmetry. The slot machine and data sections should feel like a focused instrument, not a cluttered dashboard.
- **Max content width:** 1100px (keep current)
- **Section separation:** Each major section gets a top border accent line — `2px solid rgba(247, 147, 26, 0.3)` — like a casino table edge. This creates rhythm without adding blank space.
- **Section backgrounds:** Alternate between `--color-surface-1` (#0f141a) and the base background (#080c10) to give the page visual rhythm. The slot machine card stays orange-bordered; charts and generator get the surface-1 treatment.
- **Border radius:** Mostly 6–8px. No big bubbly radii. Sharp, precise. (Exception: reel symbols can be more rounded.)

## Motion
- **Approach:** Minimal-functional. The slot machine spin IS the motion story. Everything else should be still so the spin stands out.
- **Rules:**
  - Slot reels: keep existing spin animation (it's working)
  - State transitions (buttons, hover): 150–200ms ease-out, opacity/color only
  - No layout-affecting animations on data elements (chart updates should be instant)
  - `prefers-reduced-motion`: respect it. Disable slot spin entirely if set.
- **Matrix rain:** Default OFF. Toggled by the ✨ button. This preserves it as an Easter egg without letting it compete with the data.

## Section Structure (implementation guide)
Apply this treatment to sections in order:

1. **Slot Machine card** — `background: var(--color-surface-1)`, `border: 2px solid var(--color-orange)`, `box-shadow: 0 0 30px rgba(247,147,26,0.12)`
2. **Divider accent** — `height: 2px`, `background: linear-gradient(90deg, transparent, var(--color-gold) 20%, var(--color-gold) 80%, transparent)`, `opacity: 0.3`
3. **History chart** — `background: var(--color-surface-1)`, `border-top: 2px solid var(--color-gold)` (gold top border = data section)
4. **Sentiment distribution** — same as history chart
5. **Viral Generator** — `background: var(--color-surface-1)`, `border: 2px solid rgba(39, 174, 96, 0.35)` (green border = shareable/positive feature)
6. **Footer** — `border-top: 1px solid var(--color-surface-3)`

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-06 | Bebas Neue as display font | Zero other crypto dashboards use it. Casino signage energy. Gives FGI CHAD a face. |
| 2026-04-06 | Green #27ae60 instead of neon #39ff14 | Neon green was "too loud" (user-stated). Orange is the one electric color. Everything else blends. |
| 2026-04-06 | Matrix rain default OFF, toggled | Data is the product now; slot machine is the entertainment. Rain dilutes both. Keep as Easter egg. |
| 2026-04-06 | Two surface levels (#0f141a, #141c24) | Single flat dark background made all sections look identical. Two levels create rhythm. |
| 2026-04-06 | Gold (#ffd700) for structural accents | Section dividers and slider thumb. Precious feel, used sparingly. Orange stays as the primary signal. |
