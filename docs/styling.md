# Styling

Color tokens are sourced from `public/images/entrance/wed-bg.jpg` — a vintage botanical mural (parchment, slate foliage, copper accents).

```css
:root {
  /* Color Tokens — vintage botanical */
  --bg-cream: #EDE9DF;           /* lifted parchment page bg */
  --text-espresso: #262B30;      /* cool charcoal ink */
  --accent-terracotta: #C0866A;  /* bird / butterfly copper */
  --leaf-green: #3D464B;         /* slate foliage (name kept for compat) */
  --twine-tan: #918578;          /* warm stone mid */
  --capiz-white: rgba(245, 242, 234, 0.75);

  /* Extended (see styles.css) */
  --color-palm-deep: #2A3236;
  --color-sunset-coral: #C0866A;
  --color-sunset-gold: #C9A27A;
  --color-capiz: #F5F2EA;

  /* Typography Tokens */
  --font-names: 'Pinyon Script', cursive; /* names, save-the-date, script accents */
  --font-header: 'Fraunces', serif;
  --font-body: 'Poppins', sans-serif;     /* gate greeting = tracked uppercase sans */
}
```

## Usage

- **Surfaces:** `--bg-cream` page, `--color-capiz` / `--color-surface` for raised panels
- **Type:** `--text-espresso` primary, `--color-espresso-soft` secondary
- **Gate mix:** Poppins uppercase for “We are getting married!”; Pinyon Script for names / Save the Date / date
- **Accent / CTA:** `--accent-terracotta`; dark CTAs use `--color-palm-deep` (slate, not green)
- **Avoid:** saturated olive/palm greens — foliage in the mural is cool slate
- **Note:** The burgundy mock’s flourish script is closest to *Luxurious Script* / *Corinthia* on Google Fonts; Pinyon is the chosen site script

## Global Reset Overlays

```css
body {
  background-color: var(--bg-cream);
  color: var(--text-espresso);
  font-family: var(--font-body);
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
}
```
