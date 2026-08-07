# Color Palette & Typography

Source of truth: `wed-rsvp/src/styles.css` (`:root` tokens).

Visual direction: **orchid elegant (V3)** — Soft Blue / Cobalt / Fern with cool mist surfaces. Warm copper/gold accents are retired so the triad reads clean.

---

## Color Palette

### Client triad

| Name | Hex | Role |
| --- | --- | --- |
| Soft Blue | `#8CB1CC` | Cool mid — glass, borders, soft highlights (`--color-soft-blue`) |
| Cobalt Blue | `#344879` | Deep anchor — CTAs, overlays, footer (`--color-cobalt` / `--color-palm-deep`) |
| Fern | `#7F8D54` | Organic accent — links, hover, flourishes (`--color-fern` / `--accent-terracotta`) |

### Supporting neutrals

| Token | Value | Role |
| --- | --- | --- |
| `--bg-cream` | `#EEF1F0` | Mist page background |
| `--text-espresso` | `#2A3348` | Cobalt-leaning body ink |
| `--color-espresso-soft` | `#5A6B7A` | Secondary / muted text |
| `--color-capiz` | `#F4F7F9` | Cool off-white (inverse text, panels) |
| `--leaf-green` | Fern | Accent alias (name kept for compat) |
| `--twine-tan` | Soft Blue + stone mix | Mid neutral bridge |

### Named accents (legacy names → orchid)

| Token | Resolves to | Role |
| --- | --- | --- |
| `--color-palm-deep` | Cobalt | Dark CTAs / footer weight |
| `--color-sunset-coral` | Fern | CTA hover / accent spark |
| `--color-sunset-gold` | Lifted Soft Blue | Focus / outline hover |
| `--color-teal` | Soft Blue | Cool mid alias |

### Semantic aliases

| Token | Resolves to | Role |
| --- | --- | --- |
| `--color-text` | `--text-espresso` | Body text |
| `--color-text-soft` | `--color-espresso-soft` | Secondary text |
| `--color-text-inverse` | `--color-capiz` | Text on dark surfaces |
| `--color-bg` | `--bg-cream` | App background |
| `--color-surface` | Mist + Capiz mix | Raised panels |
| `--color-accent` | Fern | Links & accents |
| `--color-gold` | Fern | Legacy “gold” → fern |

### Atmosphere

| Token | Role |
| --- | --- |
| `--gradient-sky-*` | Soft Blue → Soft Blue/Fern → Cobalt |
| `--glass-pigment` | Cobalt + Soft Blue cool glass |
| `--gate-text-shadow` | Soft cobalt halo for mural type |
| `--hero-cta-*` | Cobalt fill, Capiz label, Fern hover |

### Surface / CTA usage

| Use | Tokens |
| --- | --- |
| Page | `--bg-cream` / `--color-bg` |
| Raised panels | `--color-capiz` / `--color-surface` / cool glass |
| Primary text | `--text-espresso` / `--color-text` |
| Accent / links | Fern / `--color-accent` |
| Dark CTAs | Cobalt fill, Capiz label |
| CTA hover | Fern |
| Hero inverse text | `--hero-text` → Capiz + `--gate-text-shadow` |

### Gate couple names

Fill only (no stroke) — flip `data-name-color` on `.photobooth-gate`:

1. Soft Blue fill (default)
2. Capiz fill
3. Fern fill

---

## Typography

Fonts live in `styles.css` / `typography.css`:

**Loren Blake** (Script / Serif / Hybrid) · **Cormorant Garamond** · **Carolyna Pro Black**

### Type roles

| Token | Stack | Use |
| --- | --- | --- |
| `--font-names` / `--font-script` | Loren Blake Script | Couple names, script accents |
| `--font-date` / `--font-venue` | Loren Blake Serif | Dates, venue |
| `--font-header` / `--font-body` | Cormorant Garamond | Headings & body |
| `--font-subheading` | Carolyna Pro Black | Soft script labels |

### Gate mix (welcome)

- **Greeting:** tracked uppercase body face, Capiz soft
- **Names:** fill color from `data-name-color` + cobalt `--gate-text-shadow` (no stroke)
- **Ink on mural:** Capiz / Soft Blue with soft cobalt halo

```css
body {
  font-family: var(--font-sans);
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text);
  background-color: var(--color-bg);
  -webkit-font-smoothing: antialiased;
}
```

---

## Quick token block

```css
:root {
  /* Brand — orchid elegant V3 */
  --color-soft-blue: #8cb1cc;
  --color-cobalt: #344879;
  --color-fern: #7f8d54;

  --bg-cream: #eef1f0;
  --text-espresso: #2a3348;
  --accent-terracotta: var(--color-fern);
  --color-palm-deep: var(--color-cobalt);
  --color-capiz: #f4f7f9;

  --gate-name-fill: var(--color-soft-blue);
  --gate-text-shadow:
    0 1px 2px rgba(52, 72, 121, 0.35), 0 4px 18px rgba(52, 72, 121, 0.25);
}
```
