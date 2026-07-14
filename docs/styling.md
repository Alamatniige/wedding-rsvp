# Color Palette & Typography

Source of truth: `wed-rsvp/src/styles.css` (`:root` tokens).

Visual direction: **vintage botanical** — parchment page, cool charcoal ink, copper accents, and slate foliage pulled from `public/images/entrance/wed-bg.jpg`. Avoid saturated olive/palm greens; foliage reads as cool slate.

---

## Color Palette

### Core brand tokens

| Token | Value | Role |
| --- | --- | --- |
| `--bg-cream` | `#EDE9DF` | Page background (lifted parchment) |
| `--text-espresso` | `#262B30` | Primary text / cool charcoal ink |
| `--accent-terracotta` | `#C0866A` | Accent (bird / butterfly copper) |
| `--leaf-green` | `#3D464B` | Slate foliage (name kept for compat) |
| `--twine-tan` | `#918578` | Warm stone mid-tone |
| `--capiz-white` | `rgba(245, 242, 234, 0.75)` | Soft translucent panel wash |

### Neutrals & warm tints

| Token | Value | Role |
| --- | --- | --- |
| `--color-espresso-soft` | `#5A6166` | Secondary / muted text |
| `--color-terracotta-light` | `#D4A890` | Lighter copper hover / highlight |
| `--color-ivory` | `var(--bg-cream)` | Ivory alias |
| `--color-cream` | `var(--bg-cream)` | Cream alias |
| `--color-blush` | `#E8DDD4` | Warm blush tint |
| `--color-champagne` | `#D4CBB8` | Champagne mid |
| `--color-leaf` | `var(--leaf-green)` | Leaf alias |
| `--color-twine` | `var(--twine-tan)` | Twine alias |
| `--color-white` | `#FFFFFF` | Pure white |
| `--color-overlay` | `rgba(38, 43, 48, 0.45)` | Dark charcoal overlay |

### Named accents

| Token | Value | Role |
| --- | --- | --- |
| `--color-palm-deep` | `#2A3236` | Deep slate for dark CTAs / footer weight |
| `--color-sunset-coral` | `#C0866A` | Coral alias of terracotta |
| `--color-sunset-gold` | `#C9A27A` | Warm gold for outlines / focus |
| `--color-capiz` | `#F5F2EA` | Capiz shell off-white (inverse text, panels) |

### Semantic aliases

Components should prefer these so UI stays tied to the mural palette:

| Token | Resolves to | Role |
| --- | --- | --- |
| `--color-navy` | `--text-espresso` | Legacy “navy” → charcoal |
| `--color-navy-soft` | `--color-espresso-soft` | Soft charcoal |
| `--color-gold` | `--accent-terracotta` | Legacy “gold” → copper |
| `--color-gold-light` | `--color-terracotta-light` | Light copper |
| `--color-text` | `--text-espresso` | Body text |
| `--color-text-soft` | `--color-espresso-soft` | Secondary text |
| `--color-text-inverse` | `--color-capiz` | Text on dark surfaces |
| `--color-bg` | `--bg-cream` | App background |
| `--color-surface` | `#F5F2EA` | Raised panels |
| `--color-line` | `rgba(151, 146, 133, 0.45)` | Dividers / rules |
| `--color-accent` | `--accent-terracotta` | Links & accents |

### Gradients & atmosphere

| Token | Value | Role |
| --- | --- | --- |
| `--gradient-sky-start` | `#D4CBB8` | Parallax wash start (champagne) |
| `--gradient-sky-mid` | `#C0866A` | Mid wash (terracotta) |
| `--gradient-sky-end` | `#3D464B` | End wash (slate) |
| `--palm-silhouette` | `#262B30` | Silhouette ink |
| `--capiz-panel-bg` | `rgba(245, 242, 234, 0.62)` | Frosted panel fill |
| `--capiz-panel-border` | `rgba(255, 255, 255, 0.45)` | Frosted panel edge |
| `--capiz-panel-shadow` | `0 12px 40px rgba(38, 43, 48, 0.18)` | Soft panel depth |

### Surface / CTA usage

| Use | Tokens |
| --- | --- |
| Page | `--bg-cream` / `--color-bg` |
| Raised panels | `--color-capiz` / `--color-surface` / capiz panel tokens |
| Primary text | `--text-espresso` / `--color-text` |
| Secondary text | `--color-espresso-soft` / `--color-text-soft` |
| Accent / links | `--accent-terracotta` / `--color-accent` |
| Dark CTAs | `--color-palm-deep` fill, `--color-capiz` label |
| CTA hover | `--color-sunset-coral` |
| Focus / outline hover | `--color-sunset-gold` |
| Hero inverse text | `--hero-text` → `--color-capiz` |

---

## Typography

Google Fonts imported at the top of `styles.css`:

**Fraunces** · **Pinyon Script** · **Poppins** · **Caveat** · **Noto Sans Tagalog** · (Yellowtail available)

### Type roles

| Token | Stack | Use |
| --- | --- | --- |
| `--font-names` / `--font-script` | `"Pinyon Script", "Segoe Script", cursive` | Couple names, Save the Date, script accents |
| `--font-header` / `--font-display` | `"Fraunces", Georgia, serif` | Section titles, display headings |
| `--font-body` / `--font-sans` | `"Poppins", ui-sans-serif, system-ui, sans-serif` | Body copy, UI, gate greeting (tracked uppercase) |
| `--font-subheading` / `--font-accent` | `"Pinyon Script", "Segoe Script", cursive` | Section labels, soft script labels |
| `--font-handwriting` | `"Caveat", "Segoe Script", cursive` | Informal handwritten moments |
| `--font-baybayin` | `"Noto Sans Tagalog", "Noto Sans Buhid", sans-serif` | Baybayin / Tagalog script support |

### Utility classes

| Class | Behavior |
| --- | --- |
| `.display-name` | Fraunces, light (300), slight tracking |
| `.display-name--italic` | Italic display names |
| `.section-label` | Pinyon / small-caps feel, accent color, wide tracking |
| `.section-title` | Fraunces light, fluid `clamp(2rem, 5vw, 3rem)` |

### Gate mix (welcome)

- **Greeting** (“We are getting married!”): Poppins, uppercase, wide letter-spacing
- **Names / Save the Date / date:** Pinyon Script
- **Ink on mural:** `--gate-text` + soft parchment halo (`--gate-text-shadow`)

### Notes

- Prefer Fraunces for display; Poppins for UI density; Pinyon for romantic script moments only — don’t use script for long body copy.
- The burgundy mock’s flourish script is closest to *Luxurious Script* / *Corinthia* on Google Fonts; **Pinyon Script** is the chosen site script.
- Global body defaults: Poppins 400, `1rem` / `line-height: 1.6`, antialiased, cream background + charcoal text.

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
  /* Brand — vintage botanical */
  --bg-cream: #ede9df;
  --text-espresso: #262b30;
  --accent-terracotta: #c0866a;
  --leaf-green: #3d464b;
  --twine-tan: #918578;
  --capiz-white: rgba(245, 242, 234, 0.75);

  --color-palm-deep: #2a3236;
  --color-sunset-coral: #c0866a;
  --color-sunset-gold: #c9a27a;
  --color-capiz: #f5f2ea;

  /* Type */
  --font-names: "Pinyon Script", "Segoe Script", cursive;
  --font-header: "Fraunces", Georgia, serif;
  --font-body: "Poppins", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Fraunces", Georgia, serif;
  --font-subheading: "Pinyon Script", "Segoe Script", cursive;
}
```
